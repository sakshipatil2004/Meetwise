from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Report

router = APIRouter(tags=["reports"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/reports/{user_id}")
def get_user_reports(user_id: int, db: Session = Depends(get_db)):
    reports = db.query(Report).filter(Report.user_id == user_id).all()

    return [
        {
            "id": r.id,
            "pdf_url": f"http://127.0.0.1:8000/{r.pdf_path}",
            "created_at": r.created_at
        }
        for r in reports
    ]