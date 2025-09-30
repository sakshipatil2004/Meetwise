# backend/app/api/routes/upload.py
from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException
from fastapi.responses import JSONResponse
import shutil
import uuid
import os
import logging
from typing import Dict

from app.config import UPLOAD_DIR          # ensure this exists in app.config
from app.services.processor import process_file_job

router = APIRouter(tags=["uploads"])

# In-memory job store (MVP). Replace with DB for production.
jobs: Dict[str, Dict] = {}

logger = logging.getLogger("meetwise.upload")
logger.setLevel(logging.INFO)

@router.post("/upload-audio")
async def upload_audio(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    """
    Upload an audio/video file; schedules background processing.
    Returns job_id for status polling.
    """
    # ensure upload dir exists
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    # save uploaded file
    try:
        safe_name = f"{uuid.uuid4().hex}_{os.path.basename(file.filename)}"
        dst_path = os.path.join(UPLOAD_DIR, safe_name)

        with open(dst_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        logger.exception("Failed saving uploaded file")
        raise HTTPException(status_code=500, detail=f"Failed to save upload: {e}")

    # create job
    job_id = uuid.uuid4().hex
    jobs[job_id] = {
        "status": "queued",
        "file": dst_path,
        "transcript": None,
        "report": None,
        "pdf": None,
        "error": None,
        "timeout": None,
    }

    # schedule background processing
    try:
        background_tasks.add_task(process_file_job, job_id, dst_path, jobs)
    except Exception as e:
        logger.exception("Failed to schedule background task")
        jobs[job_id].update({"status": "error", "error": str(e)})
        raise HTTPException(status_code=500, detail="Failed to start processing task")

    return JSONResponse({"job_id": job_id, "message": "file uploaded, processing started"}, status_code=202)

@router.get("/job/{job_id}")
async def get_job(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    return jobs[job_id]
