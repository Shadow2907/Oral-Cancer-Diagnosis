from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from .routes import authentication, diagnosis, account
from .configs.database import init_db
from .configs.cloudinary import init_cloudinary
import os, redis

app = FastAPI()

# Add GZip compression
app.add_middleware(GZipMiddleware, minimum_size=1000)

origins = ["http://localhost:5173", "https://datamining-three.vercel.app/", "https://admin-dm.vercel.app/"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# origins = [
#    "http://192.168.211.:8000",
#    "http://localhost",
#    "http://localhost:8080",
# ]
# app.add_middleware(
#    CORSMiddleware,
#    allow_origins=origins,
#    allow_credentials=True,
#    allow_methods=["*"],
#    allow_headers=["*"],
# )


@app.on_event("startup")
async def on_startup():
    await init_db()
    init_cloudinary()


app.include_router(authentication.router, prefix="/api", tags=["account"])
app.include_router(diagnosis.router, prefix="/api", tags=["diagnosis"])
app.include_router(account.router, prefix="/api", tags=["account"])
