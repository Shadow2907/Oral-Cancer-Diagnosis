import json
import boto3
import datetime
from io import BytesIO
from PIL import Image, ImageFilter
import uuid
import tensorflow as tf
from tensorflow.keras.applications import DenseNet121
from tensorflow.keras.layers import GlobalAveragePooling2D
from tensorflow.keras.models import Model
import numpy as np
import cv2
from shapely.geometry import Polygon, mapping
import geojson
import keras
from keras.models import load_model

s3 = boto3.client('s3')

# Biến toàn cục
feature_extractor = None
segmentation_model = None

def mask_to_polygons(mask, min_area=100):
    print("Starting mask_to_polygons...")
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    cleaned = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
    cleaned = cv2.morphologyEx(cleaned, cv2.MORPH_CLOSE, kernel)

    contours, _ = cv2.findContours(cleaned, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    polygons = []

    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area < min_area:
            continue
        cnt = cnt.squeeze()
        if cnt.ndim != 2 or cnt.shape[0] < 3:
            continue
        poly = Polygon(cnt)
        if not poly.is_valid:
            poly = poly.buffer(0)
        if poly.is_valid and not poly.is_empty:
            polygons.append(mapping(poly))
    print(f"Extracted {len(polygons)} polygons")
    return polygons

def lambda_handler(event, context):
    global feature_extractor, segmentation_model
    
    print(f"Received event: {json.dumps(event)}")
    
    # Lazy load DenseNet121
    if feature_extractor is None:
        print("Loading DenseNet121 model...")
        try:
            base_model = DenseNet121(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
            x = base_model.output
            x = GlobalAveragePooling2D()(x)
            feature_extractor = Model(inputs=base_model.input, outputs=x)
            print("DenseNet121 model loaded successfully.")
        except Exception as e:
            print(f"Error loading DenseNet121 model: {str(e)}")
            raise
    
    # Lazy load U-Net (chỉ cần cho ảnh cancer)
    if segmentation_model is None:
        print("Loading U-Net model from HDF5...")
        try:
            segmentation_model = load_model('/var/task/unet_final_model.h5')
            print("U-Net model loaded successfully.")
        except Exception as e:
            print(f"Error loading U-Net model: {str(e)}")
            raise

    bucket = "med-image-datalake"
    results = []
    
    for record in event.get('Records', []):
        try:
            print(f"Processing record: {json.dumps(record)}")
            body = json.loads(record['body'])
            print(f"Parsed body: {json.dumps(body)}")
            for s3_record in body.get('Records', []):
                key = s3_record['s3']['object']['key']
                print(f"Processing file: {key} from bucket: {bucket}")

                parts = key.split('/')
                if len(parts) < 3 or parts[0] != "raw" or parts[1] not in ["cancer", "normal"]:
                    print(f"Invalid key format: {key}, skipping")
                    results.append({"key": key, "status": "skipped", "reason": "Invalid key format"})
                    continue

                image_category = parts[1]
                date_str = datetime.datetime.utcnow().strftime("%d-%m-%Y")
                filename = parts[-1]

                new_raw_key = f"raw/{image_category}/{date_str}/{filename}"
                copy_source = {'Bucket': bucket, 'Key': key}
                s3.copy_object(Bucket=bucket, CopySource=copy_source, Key=new_raw_key)
                print(f"File copied to: {new_raw_key}")
                s3.delete_object(Bucket=bucket, Key=key)
                print(f"Original file deleted: {key}")

                try:
                    response = s3.get_object(Bucket=bucket, Key=new_raw_key)
                    img_data = response['Body'].read()
                    image = Image.open(BytesIO(img_data))
                    image_format = image.format if image.format else 'JPEG'

                    processed_image_224 = image.resize((224, 224))
                    processed_image_224 = processed_image_224.filter(ImageFilter.SHARPEN)
                    processed_image_224 = processed_image_224.convert('RGB')

                    processed_image_256 = image.resize((256, 256))
                    processed_image_256 = processed_image_256.convert('RGB')

                    img_array_224 = np.array(processed_image_224).astype('float32')
                    img_array_224 = tf.keras.applications.densenet.preprocess_input(img_array_224)
                    img_array_224 = np.expand_dims(img_array_224, axis=0)
                    features = feature_extractor.predict(img_array_224)
                    feature_vector = features[0].tolist()

                    # Chỉ chạy U-Net cho ảnh cancer
                    features_geojson = []
                    if image_category == "cancer":
                        input_img_256 = np.array(processed_image_256).astype('float32') / 255.0
                        input_img_256 = np.expand_dims(input_img_256, axis=0)
                        predicted_mask = segmentation_model.predict(input_img_256)[0, :, :, 0]
                        threshold = 0.6
                        binary_mask = (predicted_mask > threshold).astype(np.uint8) * 255

                        polygons = mask_to_polygons(binary_mask)

                        for i, poly in enumerate(polygons):
                            feature = geojson.Feature(geometry=poly, properties={"polygon_id": i})
                            features_geojson.append(feature)

                    buffer = BytesIO()
                    processed_image_224.save(buffer, format=image_format)
                    buffer.seek(0)
                    print("Image processing completed.")
                except Exception as e:
                    print(f"Error processing image: {str(e)}")
                    results.append({"key": key, "error": str(e), "status": "failed"})
                    continue

                processed_key = f"processed/{image_category}/{date_str}/{filename}"
                s3.put_object(Bucket=bucket, Key=processed_key, Body=buffer)
                print(f"Processed image stored at: {processed_key}")

                image_id = str(uuid.uuid4())
                metadata = {
                    "id": image_id,
                    "filename": filename,
                    "raw_path": new_raw_key,
                    "processed_path": processed_key,
                    "upload_date": date_str,
                    "label": image_category,
                    "feature_matrix": feature_vector,
                    "annotations": features_geojson
                }
                metadata_key = f"metadata/{date_str}/{filename}_metadata.json"
                s3.put_object(Bucket=bucket, Key=metadata_key, Body=json.dumps(metadata))
                print(f"Metadata stored at: {metadata_key}")

                results.append({
                    "key": key,
                    "new_raw_key": new_raw_key,
                    "processed_key": processed_key,
                    "metadata_key": metadata_key,
                    "status": "success"
                })
        except Exception as e:
            print(f"Error processing record: {str(e)}")
            results.append({"key": key, "error": str(e), "status": "failed"})
            continue

    print(f"Results: {json.dumps(results)}")
    return {
        "statusCode": 200,
        "body": json.dumps({"results": results})
    }