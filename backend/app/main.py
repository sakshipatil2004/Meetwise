# backend/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# ✅ DATABASE IMPORTS (IMPORTANT)
from app.database import engine
from app.models import Base

# Import routers
from app.api.routes.upload import router as upload_router
from app.api.routes.jobs import router as jobs_router
from app.api.routes.auth import router as auth_router
from app.api.routes.reports_history import router as reports_history_router   # ✅ NEW
from app.api.routes.reports import router as reports_router
# -----------------------------
# Create FastAPI App
# -----------------------------
app = FastAPI(
    title="MeetWise Backend",
    version="2.0.0"
)

# -----------------------------
# ✅ CREATE DATABASE TABLES
# -----------------------------
Base.metadata.create_all(bind=engine)

# -----------------------------
# CORS Configuration (React Frontend)
# -----------------------------
origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Ensure reports folder exists
# -----------------------------
os.makedirs("reports", exist_ok=True)

# -----------------------------
# Include API Routers
# -----------------------------
app.include_router(upload_router, prefix="/api")
app.include_router(jobs_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(reports_history_router, prefix="/api")   # ✅ NEW
app.include_router(reports_router, prefix="/api")
# -----------------------------
# Serve Reports Folder (PDF download access)
# -----------------------------
app.mount(
    "/reports",
    StaticFiles(directory="reports"),
    name="reports"
)

# -----------------------------
# Root Health Check
# -----------------------------
@app.get("/")
def health_check():
    return {
        "status": "success",
        "message": "MeetWise backend running successfully 🚀"
    }