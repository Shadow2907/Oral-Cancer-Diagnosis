from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.diagnosis import (
    create_diagnosis,
    get_diagnosis,
    delete_diagnosis,
    predict_diagnosis,
)
from app.schemas.diagnosis import DiagnosisCreate, DiagnosisResponse
from app.utils.cloudinary_helper import upload_photo
from app.configs.database import get_db
from ..utils.jwt import get_current_user
from ..models.account import Account

router = APIRouter(prefix="/diagnosis", tags=["diagnosis"])


@router.post("/upload", response_model=DiagnosisResponse)
async def upload_diagnosis(
    file: UploadFile = File(...),
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Upload photo file to external storage
    try:
        photo_url = await upload_photo(file)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    # Predict diagnosis based on the photo URL (synchronous)
    diagnosis_result = predict_diagnosis(photo_url)

    # Prepare diagnosis data and store in database
    diagnosis_data = DiagnosisCreate(
        acc_id=current_user.acc_id, photo_url=photo_url, diagnosis=diagnosis_result
    )
    return await create_diagnosis(diagnosis_data, db)


@router.get("/{dia_id}", response_model=DiagnosisResponse)
async def get_diagnosis_controller(dia_id: int, db: AsyncSession = Depends(get_db)):
    return await get_diagnosis(dia_id, db)


@router.delete("/{dia_id}")
async def delete_diagnosis_controller(dia_id: int, db: AsyncSession = Depends(get_db)):
    return await delete_diagnosis(dia_id, db)
