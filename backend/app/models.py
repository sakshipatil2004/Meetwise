from app.database import Base
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)

    # 🔥 Relationship to reports
    reports = relationship("Report", back_populates="user", cascade="all, delete")


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)

    # ✅ MUST match __tablename__ = "users"
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    pdf_path = Column(String, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)

    # 🔥 Relationship back to user
    user = relationship("User", back_populates="reports")