from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum


class StatusEnum(str, Enum):
    Active = "Active"
    Inactive = "Inactive"


class RoleEnum(str, Enum):
    Admin = "Admin"
    User = "User"


class AccountBase(BaseModel):
    username: str
    email: EmailStr


class AccountCreate(AccountBase):
    password: str
    role: Optional[RoleEnum] = RoleEnum.User


class AccountUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    status: Optional[StatusEnum] = None


class ForgotPassword(BaseModel):
    email: EmailStr


class RequestChangePassword(BaseModel):
    old_password: str
    new_password: str
    confirm_password: str


class ChangePassword(BaseModel):
    otp_code: str


class ResetPassword(BaseModel):
    email: EmailStr
    otp_code: str
    new_password: str
    confirm_password: str


class AccountResponse(AccountBase):
    acc_id: str
    status: StatusEnum
    role: RoleEnum

    class Config:
        orm_mode = True


class VerifyOTP(BaseModel):
    email: EmailStr
    otp_code: str


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None
