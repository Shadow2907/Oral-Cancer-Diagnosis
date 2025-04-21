from fastapi import FastAPI, HTTPException, APIRouter
from ..controllers import authentication
from ..configs.database import init_db

router = APIRouter()

router.include_router(authentication.router, prefix="/api", tags=["account"])
