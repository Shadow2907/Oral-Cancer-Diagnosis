from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.configs.database import get_db
from app.utils.jwt import get_active_user
from app.models.account import Account

router = APIRouter()

@router.get("/profile")
async def get_profile(current_user: Account = Depends(get_active_user)):
    return {
        "username": current_user.username,
        "email": current_user.email
    }
