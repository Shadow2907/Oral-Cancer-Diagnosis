from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from ..configs.database import get_db
from ..services import account as account_service
from ..schemas import account as account_schema
from ..utils.jwt import get_current_user
from ..models.account import Account

router = APIRouter(prefix="/account", tags=["account"])


@router.post("/register")  # Remove response_model
async def register(
    user: account_schema.AccountCreate = Query(...), db: AsyncSession = Depends(get_db)
):
    return await account_service.register(user, db)


@router.post("/verify-registration")
async def verify_registration(
    email: str = Query(...),
    otp_code: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    return await account_service.verify_registration(email, otp_code, db)


@router.post("/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)
):
    return await account_service.login(form_data, db)


@router.post("/login/admin")
async def login_admin(
    form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)
):
    return await account_service.login_admin(form_data, db)


@router.post("/verify-otp")
async def verify_otp(
    request: account_schema.VerifyOTP = Query(...), db: AsyncSession = Depends(get_db)
):
    return await account_service.verify_otp(request, db)


@router.post("/logout")
async def logout_me(
    current_user: Account = Depends(get_current_user),
    authorization: str = Depends(OAuth2PasswordBearer(tokenUrl="token")),
    db: AsyncSession = Depends(get_db),
):
    return await account_service.logout_me(current_user, authorization, db)


@router.post("/logout/admin")
async def logout_admin(
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await account_service.logout_admin(current_user, db)


@router.post("/forgot-password")
async def forgot_password(
    request: account_schema.ForgotPassword = Query(...),
    db: AsyncSession = Depends(get_db),
):
    return await account_service.forgot_password(request, db)


@router.post("/reset-password")
async def reset_password(
    request: account_schema.ResetPassword = Query(...),
    db: AsyncSession = Depends(get_db),
):
    return await account_service.reset_passwords(request, db)


@router.post("/request-change-password")
async def request_change_password(
    request: account_schema.RequestChangePassword = Query(...),
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await account_service.request_change_password(request, current_user, db)


@router.post("/change-password")
async def change_password(
    request: account_schema.ChangePassword = Query(...),
    current_user: Account = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await account_service.change_password(request, current_user, db)
