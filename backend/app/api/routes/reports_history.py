from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Report

router = APIRouter(tags=["Report History"])

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ✅ FIRST: Specific route (detail)
@router.get("/reports/detail/{report_id}")
def get_report_detail(report_id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    return {
        "id": report.id,
        "summary": report.summary,
        "tasks": report.tasks,
        "dates": report.dates,
        "pdf_path": report.pdf_path,
        "created_at": report.created_at
    }


# ✅ SECOND: Generic route (user history)
@router.get("/reports/{user_id}")
def get_user_reports(user_id: int, db: Session = Depends(get_db)):
    reports = db.query(Report).filter(Report.user_id == user_id).all()

    return [
        {
            "id": r.id,
            "pdf_path": r.pdf_path,
            "created_at": r.created_at
        }
        for r in reports
    ]