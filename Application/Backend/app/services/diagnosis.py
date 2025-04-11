import tensorflow as tf
import numpy as np
from PIL import Image
import io
import requests
from tensorflow.keras.preprocessing.image import img_to_array # type: ignore

# Load the model
model_path = "d:/Data Mining/Oral-Cancer-Diagnosis/Application/Backend/app/ml_models/diagnosis.h5"
model = tf.keras.models.load_model(model_path)


def preprocess_image(image_url: str) -> np.ndarray:
    """
    Preprocess the image from URL for prediction
    """
    # Download image from URL
    response = requests.get(image_url)
    image = Image.open(io.BytesIO(response.content))

    # Resize image to match model's expected sizing
    image = image.resize(
        (224, 224)
    )  # Adjust size according to your model's requirements

    # Convert to array and preprocess
    image_array = img_to_array(image)
    image_array = image_array / 255.0  # Normalize pixel values
    image_array = np.expand_dims(image_array, axis=0)

    return image_array


def predict_diagnosis(image_url: str) -> str:
    """
    Predict whether the image shows cancer or not
    """
    try:
        # Preprocess the image
        processed_image = preprocess_image(image_url)

        # Make prediction
        prediction = model.predict(processed_image)

        # Convert prediction to result
        # Assuming binary classification where 1 is cancer and 0 is non-cancer
        result = "Cancer" if prediction[0][0] > 0.5 else "Non Cancer"

        return result
    except Exception as e:
        print(f"Error during prediction: {str(e)}")
        return "Prediction Error"
