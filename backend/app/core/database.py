# app/core/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Engine = "pintu gerbang" ke database
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,   # cek koneksi sebelum dipakai
    pool_size=10,          # maksimal 10 koneksi aktif bersamaan
    max_overflow=20,       # boleh tambah 20 sementara kalau penuh
)

# SessionLocal = "mesin ketik" untuk query — tiap request dapat satu
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base = "induk" dari semua model database kita
Base = declarative_base()


def get_db():
    """
    Dependency injection untuk FastAPI.
    Setiap request dapat sesi database sendiri,
    dan otomatis ditutup setelah request selesai.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()