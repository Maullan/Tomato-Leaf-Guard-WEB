# app/services/auth_service.py
import secrets
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import hash_password, verify_password, create_access_token


def register_user(db: Session, user_data: UserCreate) -> User:
    """Daftarkan user baru."""
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email sudah terdaftar"
        )

    new_user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=hash_password(user_data.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


def login_user(db: Session, email: str, password: str) -> dict:
    """Login user dan kembalikan JWT token."""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email atau password salah"
        )

    if not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email atau password salah"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akun tidak aktif"
        )

    access_token = create_access_token(data={"sub": str(user.id)})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


def update_user_profile(db: Session, user: User, update_data: UserUpdate) -> User:
    """Update profile user."""
    if update_data.full_name is not None:
        user.full_name = update_data.full_name
    if update_data.phone is not None:
        user.phone = update_data.phone
    if update_data.location is not None:
        user.location = update_data.location

    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    return user


def forgot_password(db: Session, email: str) -> str:
    """
    Generate reset token untuk forgot password.
    Mengembalikan token (di production: kirim via email).
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Jangan beritahu apakah email ada atau tidak (security)
        return "Jika email terdaftar, link reset password akan dikirim"

    # Generate token acak
    reset_token = secrets.token_urlsafe(32)
    user.reset_token = reset_token
    user.reset_token_expire = datetime.utcnow() + timedelta(hours=1)
    db.commit()

    # Di production: kirim email dengan link reset
    # Untuk sekarang return token (untuk testing via API)
    return reset_token


def reset_password(db: Session, token: str, new_password: str) -> bool:
    """Reset password menggunakan token."""
    user = db.query(User).filter(
        User.reset_token == token,
        User.reset_token_expire > datetime.utcnow()
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token tidak valid atau sudah expired"
        )

    user.hashed_password = hash_password(new_password)
    user.reset_token = None
    user.reset_token_expire = None
    user.updated_at = datetime.utcnow()
    db.commit()
    return True


def get_user_stats(db: Session, user: User) -> dict:
    """Ambil statistik diagnosis user."""
    from app.models.diagnosis import DiagnosisHistory, DiseaseInfo

    total_scan = db.query(DiagnosisHistory).filter(
        DiagnosisHistory.user_id == user.id
    ).count()

    # Hitung unique diseases terdeteksi
    total_diseases = db.query(DiagnosisHistory).filter(
        DiagnosisHistory.user_id == user.id,
        DiagnosisHistory.disease_id.isnot(None)
    ).distinct(DiagnosisHistory.disease_id).count()

    # Hitung yang healthy (confidence > 0.8 = berhasil terdeteksi dengan yakin)
    healthy_count = db.query(DiagnosisHistory).filter(
        DiagnosisHistory.user_id == user.id,
        DiagnosisHistory.confidence_score >= 0.8
    ).count()

    success_rate = (healthy_count / total_scan * 100) if total_scan > 0 else 0

    return {
        "total_scan": total_scan,
        "total_diseases": total_diseases,
        "success_rate": round(success_rate, 1)
    }