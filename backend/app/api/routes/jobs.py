# backend/app/api/routes/jobs.py
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from typing import Dict
import os

# import the same `jobs` dict instance from upload module
from app.api.routes.upload import jobs

router = APIRouter(tags=["jobs"])

@router.get("/jobs")
def list_jobs():
    """
    Return the in-memory jobs store (small MVP).
    """
    return jobs

@router.get("/jobs/{job_id}")
def job_status(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    return jobs[job_id]

@router.get("/jobs/{job_id}/download")
def download_pdf(job_id: str):
    """
    Download the generated PDF for a job if it exists.
    """
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")

    pdf_path = jobs[job_id].get("pdf")
    if not pdf_path:
        raise HTTPException(status_code=404, detail="PDF not yet available")

    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=410, detail="PDF was created but file not found on disk")

    return FileResponse(path=pdf_path, filename=os.path.basename(pdf_path), media_type="application/pdf")
