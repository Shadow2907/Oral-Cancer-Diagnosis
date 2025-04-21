from pydantic import BaseModel
from typing import Optional


class DiagnosisBase(BaseModel):
    acc_id: str
    photo_url: str
    diagnosis: str = "Non Cancer"


class DiagnosisCreate(DiagnosisBase):
    pass


class DiagnosisResponse(DiagnosisBase):
    dia_id: str

    class Config:
        orm_mode = True
