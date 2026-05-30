# app/main.py
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import engine, Base
from app.api.routes import auth, diagnosis, history

# Wajib import models supaya Base "mengenal" semua tabel
from app.models import User, DiseaseInfo, DiagnosisHistory


@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    Base.metadata.create_all(bind=engine)
    print("Database tables ready.")

    # Seed/sync DiseaseInfo agar data lama ikut diperbarui.
    from app.core.database import SessionLocal
    db = SessionLocal()
    try:
        seed_diseases(db)
        print("Disease info synced successfully.")
    finally:
        db.close()

    yield
    print("Server shutting down.")


def seed_diseases(db):
    """Seed data penyakit tomat ke database."""
    from app.models.diagnosis import DiseaseInfo as DiseaseModel
    diseases = [
        DiseaseModel(
            class_name="Tomato_Early_blight",
            display_name="Early Blight (Hawar Daun Awal)",
            description="Penyakit jamur yang disebabkan oleh Alternaria solani, menyerang daun, batang, dan buah tomat.",
            symptoms="Bercak cokelat dengan lingkaran konsentris (seperti target), daun menguning dan rontok.",
            treatment="Semprotkan fungisida berbahan aktif mancozeb atau chlorothalonil. Buang daun yang terinfeksi.",
            prevention="Hindari penyiraman pada daun, rotasi tanaman, gunakan bibit bersertifikat.",
            severity_level="medium"
        ),
        DiseaseModel(
            class_name="Tomato_Bacterial_spot",
            display_name="Bacterial Spot (Bercak Bakteri)",
            description="Penyakit bakteri yang disebabkan oleh Xanthomonas campestris, menyerang daun, batang, dan buah.",
            symptoms="Bercak kecil berair berwarna cokelat tua, daun menjadi kuning dan rontok.",
            treatment="Semprotkan tembaga sulfat atau antibiotik yang diizinkan. Buang tanaman yang terinfeksi parah.",
            prevention="Gunakan benih bebas penyakit, hindari bekerja di kebun saat basah.",
            severity_level="high"
        ),
        DiseaseModel(
            class_name="Tomato_Late_blight",
            display_name="Late Blight (Hawar Daun Akhir)",
            description="Penyakit serius yang disebabkan oleh Phytophthora infestans, dapat memusnahkan seluruh tanaman.",
            symptoms="Bercak hijau gelap atau cokelat basah pada daun, batang, dan buah.",
            treatment="Semprotkan fungisida sistemik segera. Buang dan musnahkan tanaman yang terinfeksi.",
            prevention="Jaga sirkulasi udara, hindari kelembapan berlebih, gunakan varietas tahan.",
            severity_level="high"
        ),
        DiseaseModel(
            class_name="Tomato_Leaf_Mold",
            display_name="Leaf Mold (Jamur Daun)",
            description="Penyakit jamur yang disebabkan oleh Fulvia fulva, menyerang daun tomat terutama di rumah kaca.",
            symptoms="Bercak kuning pada permukaan atas daun, pertumbuhan jamur abu-abu/cokelat di bawah daun.",
            treatment="Kurangi kelembapan, tingkatkan ventilasi. Semprotkan fungisida jika parah.",
            prevention="Jaga kelembapan di bawah 85%, hindari penyiraman pada daun.",
            severity_level="medium"
        ),
        DiseaseModel(
            class_name="Tomato_Septoria_leaf_spot",
            display_name="Septoria Leaf Spot (Bercak Septoria)",
            description="Penyakit jamur yang disebabkan oleh Septoria lycopersici.",
            symptoms="Bercak bulat kecil dengan pusat abu-abu dan tepi cokelat, muncul di daun tua lebih dulu.",
            treatment="Buang daun yang terinfeksi, semprotkan fungisida mancozeb atau copper.",
            prevention="Mulsa tanah, hindari percikan air, rotasi tanaman 2 tahun.",
            severity_level="medium"
        ),
        DiseaseModel(
            class_name="Tomato_Spider_mites",
            display_name="Spider Mites (Tungau Laba-laba)",
            description="Serangan hama tungau yang menyebabkan kerusakan daun tomat.",
            symptoms="Daun berbintik kuning/putih, tampak jaring halus di bawah daun, daun mengering.",
            treatment="Semprotkan insektisida/akarisida. Cuci tanaman dengan air. Gunakan predator alami.",
            prevention="Jaga kelembapan, hindari stres tanaman, semprotkan air secara rutin.",
            severity_level="medium"
        ),
        DiseaseModel(
            class_name="Tomato_Target_Spot",
            display_name="Target Spot (Bercak Target)",
            description="Penyakit jamur yang disebabkan oleh Corynespora cassiicola.",
            symptoms="Bercak cokelat dengan pola cincin konsentris seperti target panah.",
            treatment="Semprotkan fungisida azoxystrobin atau chlorothalonil.",
            prevention="Rotasi tanaman, jaga sirkulasi udara, hindari kelembapan berlebih.",
            severity_level="medium"
        ),
        DiseaseModel(
            class_name="Tomato_Yellow_Leaf_Curl_Virus",
            display_name="Yellow Leaf Curl Virus (Virus Keriting Daun Kuning)",
            description="Penyakit virus yang ditularkan oleh kutu kebul (Bemisia tabaci).",
            symptoms="Daun menguning dan mengkerut, tanaman kerdil, buah sedikit.",
            treatment="Tidak ada obat. Musnahkan tanaman yang terinfeksi. Kendalikan vektor kutu kebul.",
            prevention="Gunakan varietas tahan, pasang mulsa plastik perak, kendalikan kutu kebul.",
            severity_level="high"
        ),
        DiseaseModel(
            class_name="Tomato_mosaic_virus",
            display_name="Mosaic Virus (Virus Mosaik)",
            description="Penyakit virus yang menyebabkan pola mosaik pada daun tomat.",
            symptoms="Pola mosai kuning-hijau pada daun, daun melengkung, pertumbuhan terhambat.",
            treatment="Tidak ada obat. Buang tanaman yang terinfeksi. Cuci tangan dan alat.",
            prevention="Gunakan benih bersertifikat, kendalikan serangga vektor, hindari merokok di kebun.",
            severity_level="high"
        ),
        DiseaseModel(
            class_name="Tomato_healthy",
            display_name="Sehat (Healthy)",
            description="Tanaman tomat dalam kondisi sehat, tidak terdeteksi penyakit.",
            symptoms="Daun berwarna hijau segar, tidak ada bercak atau kerusakan.",
            treatment="Tidak diperlukan pengobatan.",
            prevention="Lanjutkan praktik perawatan yang baik: penyiraman teratur, pemupukan seimbang.",
            severity_level="low"
        ),
        DiseaseModel(
            class_name="Tidak_Terdefinisi",
            display_name="Tidak Terdefinisi",
            description="Foto tidak cocok dengan class penyakit atau daun sehat yang dikenal model.",
            symptoms="Objek pada foto tidak sesuai dengan dataset daun tomat yang dilatih pada model.",
            treatment="Ulangi diagnosis dengan foto daun tomat yang jelas, fokus, dan memiliki pencahayaan cukup.",
            prevention="Gunakan foto daun tomat yang memenuhi area gambar dan hindari objek selain daun.",
            severity_level="unknown"
        ),
    ]
    for disease in diseases:
        existing = db.query(DiseaseModel).filter(
            DiseaseModel.class_name == disease.class_name
        ).first()

        if existing:
            existing.display_name = disease.display_name
            existing.description = disease.description
            existing.symptoms = disease.symptoms
            existing.treatment = disease.treatment
            existing.prevention = disease.prevention
            existing.severity_level = disease.severity_level
        else:
            db.add(disease)

    db.commit()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="API untuk deteksi penyakit daun tomat menggunakan AI",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files (gambar upload)
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

app.include_router(auth.router,      prefix="/api/v1/auth",      tags=["Authentication"])
app.include_router(diagnosis.router, prefix="/api/v1/diagnosis", tags=["Diagnosis"])
app.include_router(history.router,   prefix="/api/v1/history",   tags=["History"])


@app.get("/", tags=["Health Check"])
def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs",
    }
