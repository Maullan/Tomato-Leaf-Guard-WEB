# app/schemas/diagnosis.py
import uuid
from datetime import datetime
from pydantic import BaseModel


class DiseaseInfoResponse(BaseModel):
    """Info lengkap satu penyakit"""
    id: int
    class_name: str
    display_name: str
    description: str | None
    symptoms: str | None
    treatment: str | None
    prevention: str | None
    severity_level: str | None

    class Config:
        from_attributes = True


class DiagnosisResponse(BaseModel):
    """Response setelah upload gambar dan dapat hasil diagnosis"""
    id: uuid.UUID
    image_path: str
    confidence_score: float | None
    severity_percent: float | None
    notes: str | None
    diagnosed_at: datetime
    disease: DiseaseInfoResponse | None

    class Config:
        from_attributes = True


class DiagnosisHistoryResponse(BaseModel):
    """Response untuk satu item di riwayat diagnosis"""
    id: uuid.UUID
    image_path: str
    confidence_score: float | None
    severity_percent: float | None
    diagnosed_at: datetime
    disease: DiseaseInfoResponse | None

    class Config:
        from_attributes = True