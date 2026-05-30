# app/utils/seed_disease.py
from app.core.database import SessionLocal
from app.models.diagnosis import DiseaseInfo


def seed_diseases():
    db = SessionLocal()

    # Cek kalau sudah ada datanya, skip
    if db.query(DiseaseInfo).count() > 0:
        print("Disease data already seeded.")
        db.close()
        return

    diseases = [
        DiseaseInfo(
            class_name="Tomato_healthy",
            display_name="Daun Sehat",
            description="Daun tomat dalam kondisi sehat tanpa penyakit.",
            symptoms="Daun berwarna hijau segar, tidak ada bercak.",
            treatment="Tidak diperlukan penanganan khusus.",
            prevention="Jaga kelembaban dan nutrisi tanah.",
            severity_level="none"
        ),
        DiseaseInfo(
            class_name="Tomato_Early_blight",
            display_name="Hawar Daun Awal",
            description="Penyakit jamur yang menyerang daun tua lebih dulu.",
            symptoms="Bercak coklat tua berbentuk cincin konsentris pada daun.",
            treatment="Semprot fungisida berbahan aktif klorotalonil atau mankozeb.",
            prevention="Rotasi tanaman, hindari penyiraman dari atas.",
            severity_level="medium"
        ),
        DiseaseInfo(
            class_name="Tomato_Late_blight",
            display_name="Hawar Daun Akhir",
            description="Penyakit jamur air yang sangat merusak, bisa menyebar cepat.",
            symptoms="Bercak basah hijau gelap pada daun, putih di bawah daun.",
            treatment="Fungisida berbahan metalaksil, buang bagian terinfeksi.",
            prevention="Pilih varietas tahan, hindari kelembaban tinggi.",
            severity_level="high"
        ),
        DiseaseInfo(
            class_name="Tomato_Leaf_Mold",
            display_name="Kapang Daun",
            description="Jamur yang tumbuh di permukaan daun saat kelembaban tinggi.",
            symptoms="Bercak kuning di atas daun, lapisan abu-abu di bawah.",
            treatment="Kurangi kelembaban, semprot fungisida.",
            prevention="Sirkulasi udara yang baik di kebun.",
            severity_level="medium"
        ),
        DiseaseInfo(
            class_name="Tomato_Septoria_leaf_spot",
            display_name="Bercak Daun Septoria",
            description="Penyakit jamur yang menghasilkan banyak bercak kecil.",
            symptoms="Bercak kecil bulat dengan pusat putih dan tepi coklat.",
            treatment="Fungisida mankozeb, buang daun yang terinfeksi.",
            prevention="Hindari percikan air dari tanah ke daun.",
            severity_level="medium"
        ),
        DiseaseInfo(
            class_name="Tomato_Spider_mites",
            display_name="Tungau Laba-laba",
            description="Serangan hama tungau yang menghisap cairan daun.",
            symptoms="Daun berbintik kuning, terlihat jaring halus di bawah daun.",
            treatment="Semprotkan akarisida atau air sabun.",
            prevention="Jaga kelembaban, musuh alami seperti predator tungau.",
            severity_level="medium"
        ),
        DiseaseInfo(
            class_name="Tomato_Target_Spot",
            display_name="Bercak Target",
            description="Penyakit jamur dengan pola bercak seperti sasaran tembak.",
            symptoms="Bercak coklat dengan lingkaran konsentris, kuning di sekitarnya.",
            treatment="Fungisida, buang daun terinfeksi segera.",
            prevention="Rotasi tanaman dan sanitasi kebun.",
            severity_level="medium"
        ),
        DiseaseInfo(
            class_name="Tomato_mosaic_virus",
            display_name="Virus Mosaik Tomat",
            description="Penyakit virus yang mengganggu pertumbuhan daun.",
            symptoms="Pola mosaik hijau-kuning tidak beraturan pada daun.",
            treatment="Tidak ada obat, cabut dan musnahkan tanaman terinfeksi.",
            prevention="Gunakan benih bersertifikat, kendalikan serangga vektor.",
            severity_level="high"
        ),
        DiseaseInfo(
            class_name="Tomato_Yellow_Leaf_Curl_Virus",
            display_name="Virus Keriting Daun Kuning",
            description="Virus yang disebarkan kutu kebul, sangat merusak.",
            symptoms="Daun menggulung ke atas, menguning, tanaman kerdil.",
            treatment="Tidak ada obat, cabut tanaman terinfeksi.",
            prevention="Kendalikan kutu kebul dengan insektisida atau perangkap.",
            severity_level="high"
        ),
        DiseaseInfo(
            class_name="Tomato_Bacterial_spot",
            display_name="Bercak Bakteri",
            description="Penyakit bakteri yang menyerang daun dan buah.",
            symptoms="Bercak kecil basah berwarna coklat tua, tepi kuning.",
            treatment="Bakterisida berbahan tembaga, buang bagian terinfeksi.",
            prevention="Benih bebas penyakit, hindari penyiraman dari atas.",
            severity_level="medium"
        ),
    ]

    db.add_all(diseases)
    db.commit()
    print(f"Seeded {len(diseases)} diseases successfully.")
    db.close()


if __name__ == "__main__":
    seed_diseases()