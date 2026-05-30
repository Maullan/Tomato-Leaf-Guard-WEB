# app/api/routes/auth.py
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
import os, uuid, shutil

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.config import settings
from app.schemas.user import (
    UserCreate, UserLogin, Token, UserResponse,
    UserUpdate, ForgotPasswordRequest, ResetPasswordRequest, UserStatsResponse
)
from app.services.auth_service import (
    register_user, login_user, update_user_profile,
    forgot_password, reset_password, get_user_stats
)

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=201)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Daftarkan akun baru."""
    return register_user(db, user_data)


@router.post("/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """Login dan dapatkan JWT token."""
    return login_user(db, user_data.email, user_data.password)


@router.get("/me", response_model=UserResponse)
def get_me(current_user=Depends(get_current_user)):
    """Ambil data user yang sedang login."""
    return current_user


@router.put("/profile", response_model=UserResponse)
def update_profile(
    update_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Update profil user (nama, telepon, lokasi)."""
    return update_user_profile(db, current_user, update_data)


@router.post("/avatar", response_model=UserResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Upload foto profil user."""
    # Validasi tipe file
    ext = file.filename.split(".")[-1].lower()
    if ext not in ["jpg", "jpeg", "png", "webp"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Format file tidak didukung. Gunakan JPG, PNG, atau WEBP"
        )

    # Simpan file
    avatar_dir = os.path.join(settings.UPLOAD_DIR, "avatars")
    os.makedirs(avatar_dir, exist_ok=True)
    filename = f"{uuid.uuid4()}.{ext}"
    file_path = os.path.join(avatar_dir, filename)

    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    # Update avatar_url di database
    current_user.avatar_url = f"/uploads/avatars/{filename}"
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/forgot-password")
def forgot_password_endpoint(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    """Kirim link reset password ke email."""
    token = forgot_password(db, request.email)
    return {
        "message": "Jika email terdaftar, instruksi reset password telah dikirim",
        "reset_token": token  # Di production: hapus ini, kirim via email
    }


@router.post("/reset-password")
def reset_password_endpoint(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    """Reset password menggunakan token."""
    reset_password(db, request.token, request.new_password)
    return {"message": "Password berhasil direset. Silakan login dengan password baru."}


@router.get("/stats", response_model=UserStatsResponse)
def get_stats(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """Ambil statistik diagnosis untuk tampilan profil."""
    return get_user_stats(db, current_user)


@router.post("/logout")
def logout():
    """
    Logout — untuk stateless JWT, client harus hapus token dari storage.
    """
    return {"message": "Berhasil logout. Silakan hapus token dari local storage."}