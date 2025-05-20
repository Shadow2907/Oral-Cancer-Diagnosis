from fastapi import FastAPI, HTTPException, APIRouter
from ..controllers.user import diagnosis
from ..controllers.guest import diagnosis as guest_diagnosis
from ..controllers.admin import manage_diagnosis as admin_diagnosis
from ..configs.database import init_db

router = APIRouter()

router.include_router(diagnosis.router, prefix="/api", tags=["diagnosis"])
router.include_router(guest_diagnosis.router, prefix="/api", tags=["guest-diagnosis"])
router.include_router(admin_diagnosis.router, prefix="/api", tags=["admin-diagnosis"])
