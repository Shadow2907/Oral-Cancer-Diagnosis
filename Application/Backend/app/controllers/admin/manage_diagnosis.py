from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.diagnosis import (
    get_all_diagnoses,
    get_diagnosis,
    update_diagnosis,
    delete_diagnosis,
)
from app.schemas.diagnosis import DiagnosisResponse, DiagnosisUpdate
from app.configs.database import get_db
from ...utils.jwt import get_admin
from ...models.account import Account

router = APIRouter(prefix="/admin/diagnosis", tags=["admin-diagnosis"])


@router.get("/", response_model=list[DiagnosisResponse])
async def list_all_diagnoses(
    skip: int = 0,
    limit: int = 10,
    db: AsyncSession = Depends(get_db),
    admin: Account = Depends(get_admin),
):
    return await get_all_diagnoses(db, skip, limit)


@router.get("/{dia_id}", response_model=DiagnosisResponse)
async def get_diagnosis_by_id(
    dia_id: str, db: AsyncSession = Depends(get_db), admin: Account = Depends(get_admin)
):
    return await get_diagnosis(dia_id, db)


@router.put("/{dia_id}", response_model=DiagnosisResponse)
async def update_diagnosis_by_id(
    dia_id: str,
    diagnosis_data: DiagnosisUpdate,
    db: AsyncSession = Depends(get_db),
    admin: Account = Depends(get_admin),
):
    return await update_diagnosis(dia_id, diagnosis_data, db)


@router.delete("/{dia_id}")
async def delete_diagnosis_by_id(
    dia_id: str, db: AsyncSession = Depends(get_db), admin: Account = Depends(get_admin)
):
    return await delete_diagnosis(dia_id, db)
