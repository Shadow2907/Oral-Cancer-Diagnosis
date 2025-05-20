from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql.schema import ForeignKey
from app.configs.database import Base


class Diagnosis(Base):
    __tablename__ = "diagnosis"
    dia_id = Column(String, primary_key=True, index=True)
    acc_id = Column(String, ForeignKey("account.acc_id"), index=True)
    photo_url = Column(String)
    diagnosis = Column(String, default="Cancer")
    created_at = Column(DateTime)
    segmentation_url = Column(String)
