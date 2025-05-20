from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
from app.services.diagnosis import create_diagnosis, get_all_diagnoses_by_user
from app.schemas.diagnosis import DiagnosisCreate, DiagnosisResponse
from app.configs.database import get_db
from ...utils.jwt import get_admin_user
from ...models.account import Account

router = APIRouter(prefix="/admin/diagnosis", tags=["admin-diagnosis"])


@router.get("/user/{user_id}", response_model=list[DiagnosisResponse])
async def get_user_diagnoses(
    user_id: str,
    current_admin: Account = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    return await get_all_diagnoses_by_user(db, user_id)
