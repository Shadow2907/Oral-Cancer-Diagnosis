from sqlalchemy import Column, Integer, String, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.schema import ForeignKey
from ..configs.database import Base
import enum


class StatusEnum(enum.Enum):
    Active = "Active"
    Inactive = "Inactive"


class RoleEnum(enum.Enum):
    Admin = "Admin"
    User = "User"


class Account(Base):
    __tablename__ = "account"
    acc_id = Column(String, primary_key=True, index=True, unique=True)
    username = Column(String, index=True, unique=True)
    password = Column(String)
    email = Column(String, index=True, unique=True)
    role = Column(Enum(RoleEnum), default=RoleEnum.User, nullable=False)
    status = Column(Enum(StatusEnum), default=StatusEnum.Active, nullable=False)
