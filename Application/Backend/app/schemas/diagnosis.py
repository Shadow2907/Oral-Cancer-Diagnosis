from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DiagnosisBase(BaseModel):
    acc_id: str
    photo_url: str
    diagnosis: Optional[str] = "Non Cancer"
    segmentation_url: Optional[str] = None
    created_at: Optional[datetime] = None


class DiagnosisCreate(DiagnosisBase):
    pass


class DiagnosisResponse(DiagnosisBase):
    dia_id: str

    class Config:
        from_attributes = True


class DiagnosisUpdate(BaseModel):
    photo_url: Optional[str] = None
    diagnosis: Optional[str] = None
    segmentation_url: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
