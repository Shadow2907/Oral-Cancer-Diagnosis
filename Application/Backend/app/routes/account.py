from fastapi import FastAPI, HTTPException, APIRouter
from ..controllers.admin import account
from ..controllers.user import account as user_account
from ..configs.database import init_db

router = APIRouter()

router.include_router(account.router, prefix="/api", tags=["account"])
router.include_router(user_account.router, prefix="/api/user", tags=["user account"])
