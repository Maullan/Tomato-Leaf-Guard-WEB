# app/api/routes/history.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.diagnosis import DiagnosisHistory
from app.schemas.diagnosis import DiagnosisHistoryResponse

router = APIRouter()


@router.get("/", response_model=List[DiagnosisHistoryResponse])
def get_history(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Ambil riwayat diagnosis milik user yang sedang login.
    Support pagination: ?page=1&limit=10
    """
    offset = (page - 1) * limit

    histories = db.query(DiagnosisHistory).filter(
        DiagnosisHistory.user_id == current_user.id
    ).order_by(
        DiagnosisHistory.diagnosed_at.desc()  # terbaru di atas
    ).offset(offset).limit(limit).all()

    return histories


@router.delete("/{diagnosis_id}", status_code=204)
def delete_history(
    diagnosis_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Hapus satu riwayat diagnosis"""
    diagnosis = db.query(DiagnosisHistory).filter(
        DiagnosisHistory.id == diagnosis_id,
        DiagnosisHistory.user_id == current_user.id
    ).first()

    if not diagnosis:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Diagnosis tidak ditemukan"
        )

    db.delete(diagnosis)
    db.commit()