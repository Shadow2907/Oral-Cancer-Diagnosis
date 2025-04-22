import tensorflow as tf
import numpy as np
from PIL import Image
import io
import requests
from tensorflow.keras.preprocessing.image import img_to_array  # type: ignore
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status
from app.models.diagnosis import Diagnosis
from app.schemas.diagnosis import DiagnosisCreate, DiagnosisResponse, DiagnosisUpdate
import uuid  # added for auto-generating dia_id

# Load the model
model_path = "app/ai model/oral_cancer_classification_modelV3 (1).h5"
model = tf.keras.models.load_model(model_path)


def preprocess_image(image_url: str) -> np.ndarray:
    """
    Preprocess the image from URL for prediction using DenseNet121 standard preprocessing
    """
    # Download image from URL
    response = requests.get(image_url)
    image = Image.open(io.BytesIO(response.content))

    # Convert grayscale to RGB if needed
    if image.mode != "RGB":
        image = image.convert("RGB")

    # Resize image to match DenseNet121's expected input size
    image = image.resize((224, 224))

    # Convert to array
    image_array = img_to_array(image)

    # Apply proper preprocessing for DenseNet121
    # Option 1: Standard ImageNet preprocessing
    image_array = tf.keras.applications.densenet.preprocess_input(image_array)

    # Expand dimensions to create batch of size 1
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
        print(f"Raw prediction: {prediction}")

        # Convert prediction to result
        # Assuming binary classification where 1 is cancer and 0 is non-cancer
        result = "Cancer" if prediction[0][0] < 0.5 else "Non Cancer"
        return result
    except Exception as e:
        print(f"Error during prediction: {str(e)}")
        return "Prediction Error"


async def create_diagnosis(
    diagnosis_data: DiagnosisCreate, db: AsyncSession
) -> DiagnosisResponse:
    # Create new diagnosis record
    diagnosis_dict = diagnosis_data.dict()
    diagnosis_dict["dia_id"] = str(uuid.uuid4())  # auto-generate dia_id
    new_diagnosis = Diagnosis(**diagnosis_dict)
    db.add(new_diagnosis)
    await db.commit()
    await db.refresh(new_diagnosis)
    return DiagnosisResponse(
        dia_id=new_diagnosis.dia_id,
        acc_id=new_diagnosis.acc_id,
        photo_url=new_diagnosis.photo_url,
        diagnosis=new_diagnosis.diagnosis,
    )


async def get_diagnosis(dia_id: int, db: AsyncSession) -> DiagnosisResponse:
    # Retrieve a diagnosis record by its ID
    stmt = select(Diagnosis).where(Diagnosis.dia_id == dia_id)
    result = await db.execute(stmt)
    diagnosis_obj = result.scalar_one_or_none()
    if not diagnosis_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Diagnosis not found"
        )
    return DiagnosisResponse.from_orm(diagnosis_obj)


async def delete_diagnosis(dia_id: int, db: AsyncSession) -> dict:
    # Delete a diagnosis record by its ID
    stmt = select(Diagnosis).where(Diagnosis.dia_id == dia_id)
    result = await db.execute(stmt)
    diagnosis_obj = result.scalar_one_or_none()
    if not diagnosis_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Diagnosis not found"
        )
    await db.delete(diagnosis_obj)
    await db.commit()
    return {"detail": "Diagnosis deleted successfully"}


async def get_all_diagnoses(db: AsyncSession, skip: int = 0, limit: int = 10):
    stmt = select(Diagnosis).offset(skip).limit(limit)
    result = await db.execute(stmt)
    diagnoses = result.scalars().all()
    return [DiagnosisResponse.from_orm(d) for d in diagnoses]


async def update_diagnosis(
    dia_id: int, diagnosis_data: DiagnosisUpdate, db: AsyncSession
):
    stmt = select(Diagnosis).where(Diagnosis.dia_id == dia_id)
    result = await db.execute(stmt)
    diagnosis = result.scalar_one_or_none()

    if not diagnosis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Diagnosis not found"
        )

    for key, value in diagnosis_data.dict(exclude_unset=True).items():
        setattr(diagnosis, key, value)

    await db.commit()
    await db.refresh(diagnosis)
    return DiagnosisResponse.from_orm(diagnosis)
