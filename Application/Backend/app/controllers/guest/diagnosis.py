from fastapi import APIRouter, UploadFile, File, HTTPException, status
from app.services.diagnosis import predict_diagnosis
from app.utils.cloudinary_helper import upload_photo

router = APIRouter(prefix="/guest/diagnosis", tags=["guest-diagnosis"])


@router.post("/predict")
async def guest_predict(file: UploadFile = File(...)):
    try:
        photo_url = await upload_photo(file)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    diagnosis_result = predict_diagnosis(photo_url)
    return {"photo_url": photo_url, "diagnosis": diagnosis_result}
