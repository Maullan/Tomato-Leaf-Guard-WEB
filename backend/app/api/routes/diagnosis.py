# app/api/routes/diagnosis.py
import uuid
from pathlib import Path
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.config import settings
from app.models.user import User
from app.models.diagnosis import DiagnosisHistory, DiseaseInfo
from app.schemas.diagnosis import DiagnosisResponse

router = APIRouter()


def validate_image(file: UploadFile) -> None:
    """Validasi tipe dan ukuran file gambar"""
    ext = file.filename.split(".")[-1].lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Format file tidak didukung. Gunakan: {settings.ALLOWED_EXTENSIONS}"
        )
    file.file.seek(0, 2)
    size_mb = file.file.tell() / (1024 * 1024)
    file.file.seek(0)
    if size_mb > settings.MAX_UPLOAD_SIZE_MB:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ukuran file maksimal {settings.MAX_UPLOAD_SIZE_MB}MB"
        )


def get_upload_url(file_path: str | Path) -> str:
    upload_root = Path(settings.UPLOAD_DIR).resolve()
    path = Path(file_path).resolve()

    try:
        relative_path = path.relative_to(upload_root)
    except ValueError:
        relative_path = path.name

    return f"/uploads/{Path(relative_path).as_posix()}"


@router.post("/", response_model=DiagnosisResponse, status_code=201)
async def diagnose(
    file: UploadFile = File(..., description="Foto daun tomat"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload foto daun tomat dan dapatkan hasil diagnosis AI."""
    # 1. Validasi file
    validate_image(file)

    # 2. Simpan file original ke folder uploads/original
    upload_dir = Path(settings.UPLOAD_DIR)
    original_dir = upload_dir / "original"
    original_dir.mkdir(parents=True, exist_ok=True)

    file_ext = file.filename.split(".")[-1].lower()
    file_id = uuid.uuid4()
    unique_filename = f"{file_id}.{file_ext}"
    file_path = original_dir / unique_filename

    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    # 3. Jalankan pipeline model AI. ai_service akan melakukan remove bg jika dibutuhkan.
    processed_dir = Path(settings.PROCESSED_UPLOAD_DIR)
    processed_path = processed_dir / f"{file_id}_nobg.jpg"
    from app.services.ai_service import predict_disease
    prediction = predict_disease(
        str(file_path),
        processed_output_path=str(processed_path),
    )

    prediction_path = Path(prediction.get("processed_image_path") or file_path)

    # 4. Cari disease_info berdasarkan class_name hasil prediksi
    disease = db.query(DiseaseInfo).filter(
        DiseaseInfo.class_name == prediction["class_name"]
    ).first()

    # 5. Simpan hasil ke database (tampilkan gambar yang sudah diproses jika tersedia)
    image_url = get_upload_url(prediction_path)
    diagnosis = DiagnosisHistory(
        user_id=current_user.id,
        disease_id=disease.id if disease else None,
        image_path=image_url,
        confidence_score=prediction["confidence"],
        severity_percent=prediction["severity"],
        notes=prediction.get("notes")
    )
    db.add(diagnosis)
    db.commit()
    db.refresh(diagnosis)

    return diagnosis


@router.get("/{diagnosis_id}", response_model=DiagnosisResponse)
def get_diagnosis(
    diagnosis_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Ambil detail satu hasil diagnosis"""
    diagnosis = db.query(DiagnosisHistory).filter(
        DiagnosisHistory.id == diagnosis_id,
        DiagnosisHistory.user_id == current_user.id
    ).first()

    if not diagnosis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Diagnosis tidak ditemukan"
        )
    return diagnosis
