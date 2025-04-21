from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from .routes import account
from .configs.database import init_db
from .configs.cloudinary import init_cloudinary
import os, redis

app = FastAPI()

# Add GZip compression
app.add_middleware(GZipMiddleware, minimum_size=1000)

@app.on_event("startup")
async def on_startup():
    await init_db()
    init_cloudinary()


app.include_router(account.router, prefix="/api", tags=["account"])
