

# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles  # <-- added

# Import routers
from app.api.routes.upload import router as upload_router
from app.api.routes.jobs import router as jobs_router

# Create FastAPI app
app = FastAPI(title="MeetWise Backend")

# CORS middleware so frontend (React/Vite) can call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "*"],  # add your frontend prod URL here
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers under /api
app.include_router(upload_router, prefix="/api")
app.include_router(jobs_router, prefix="/api")

# Serve the 'reports' folder so PDFs can be downloaded
app.mount("/reports", StaticFiles(directory="reports"), name="reports")  # <-- added

# Health check
@app.get("/")
def read_root():
    return {"status": "ok", "message": "MeetWise backend running fine!"}
