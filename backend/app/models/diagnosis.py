# app/models/diagnosis.py
import uuid
from datetime import datetime
from sqlalchemy import String, Float, Text, DateTime, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base


class DiseaseInfo(Base):
    __tablename__ = "disease_info"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    class_name: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
        comment="Nama kelas dari model AI, misal: Tomato_Early_blight"
    )
    display_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        comment="Nama tampilan, misal: Hawar Daun Awal"
    )
    description: Mapped[str] = mapped_column(Text, nullable=True)
    symptoms: Mapped[str] = mapped_column(Text, nullable=True)
    treatment: Mapped[str] = mapped_column(Text, nullable=True)
    prevention: Mapped[str] = mapped_column(Text, nullable=True)
    severity_level: Mapped[str] = mapped_column(
        String(20),
        nullable=True,
        comment="low / medium / high"
    )

    # Relasi ke history
    diagnoses: Mapped[list["DiagnosisHistory"]] = relationship(
        "DiagnosisHistory",
        back_populates="disease"
    )


class DiagnosisHistory(Base):
    __tablename__ = "diagnosis_history"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    # FK ke tabel users
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )
    # FK ke tabel disease_info
    disease_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("disease_info.id"),
        nullable=True  # nullable: kalau model tidak yakin, boleh null
    )
    image_path: Mapped[str] = mapped_column(String(500), nullable=False)
    confidence_score: Mapped[float] = mapped_column(
        Float,
        nullable=True,
        comment="Nilai 0.0 - 1.0, misal 0.95 = 95% yakin"
    )
    severity_percent: Mapped[float] = mapped_column(
        Float,
        nullable=True,
        comment="Estimasi keparahan dalam persen, misal 35.0"
    )
    notes: Mapped[str] = mapped_column(Text, nullable=True)
    diagnosed_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    # Relasi balik ke User dan DiseaseInfo
    user: Mapped["User"] = relationship("User", back_populates="diagnoses")
    disease: Mapped["DiseaseInfo"] = relationship(
        "DiseaseInfo",
        back_populates="diagnoses"
    )