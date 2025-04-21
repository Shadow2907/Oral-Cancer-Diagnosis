from fastapi import FastAPI, HTTPException, APIRouter
from ..controllers import diagnosis
from ..configs.database import init_db

router = APIRouter()

router.include_router(diagnosis.router, prefix="/api", tags=["diagnosis"])
