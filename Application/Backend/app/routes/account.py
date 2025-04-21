from fastapi import FastAPI, HTTPException, APIRouter
from ..controllers.admin import account
from ..configs.database import init_db

router = APIRouter()

router.include_router(account.router, prefix="/api", tags=["account"])
