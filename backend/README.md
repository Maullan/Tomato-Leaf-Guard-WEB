# Full-Stack-Tomato-LeafGuard-AI

## Integrasi Model AI

Backend akan memakai model Keras dari:

```env
MODEL_PATH=ai_model/model_tomato_leaf_guardai.keras
REMOVE_BACKGROUND_ENABLED=True
PROCESSED_UPLOAD_DIR=uploads/processed
```

Letakkan file model di `backend/ai_model/model_tomato_leaf_guardai.keras`.
Service diagnosis otomatis membaca ukuran input dari model, jadi model baru
`128x128x3` tetap bisa dipakai tanpa mengubah kode.

Setelah upload, file original disimpan di `uploads/original`. Saat
`predict_disease` dipanggil, `ai_service` membuat versi gambar dengan background
netral di `uploads/processed`, lalu memakai gambar processed itu untuk inference
model. Ini menjaga preprocessing inference sama dengan model baru yang memakai
proses hapus background.

Model `model_tomato_leaf_guardai.keras` terdeteksi memiliki 11 output. Output
ke-11 dipakai untuk class `Tidak_Terdefinisi`, yaitu ketika foto tidak cocok
dengan semua class dataset daun tomat yang dikenal model.

Jika model punya urutan class khusus, isi `MODEL_CLASS_NAMES` di `.env` sesuai
urutan output saat training.
