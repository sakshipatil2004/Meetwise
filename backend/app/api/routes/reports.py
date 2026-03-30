from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Report

router = APIRouter(prefix="/reports", tags=["Reports"])

# -------------------------
# Database Dependency
# -------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -------------------------
# Base URL (avoid hardcoding later)
# -------------------------
BASE_URL = "http://127.0.0.1:8000"


# -------------------------
# ✅ 1. Get Report Detail
# -------------------------
@router.get("/detail/{report_id}")
def get_report_detail(report_id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    return {
        "id": report.id,
        "summary": report.summary,
        "tasks": report.tasks,
        "dates": report.dates,
        "pdf_url": f"{BASE_URL}/{report.pdf_path}" if report.pdf_path else None,
        "created_at": report.created_at,
        "meeting_date": report.meeting_date
    }


# -------------------------
# ✅ 2. Get All Reports of a User
# -------------------------
@router.get("/user/{user_id}")
def get_user_reports(user_id: int, db: Session = Depends(get_db)):
    reports = db.query(Report).filter(Report.user_id == user_id).all()

    if not reports:
        return []

    return [
        {
            "id": r.id,
            "pdf_url": f"{BASE_URL}/{r.pdf_path}" if r.pdf_path else None,
            "created_at": r.created_at,
            "meeting_date": r.meeting_date
        }
        for r in reports
    ]