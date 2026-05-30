# app/services/ai_service.py
import random
import os
import logging
from functools import lru_cache
from pathlib import Path

logger = logging.getLogger(__name__)

BACKEND_DIR = Path(__file__).resolve().parents[2]

# Daftar class penyakit tomat yang dikenal model
DISEASE_CLASSES = [
    "Tomato_Early_blight",
    "Tomato_Bacterial_spot",
    "Tomato_Late_blight",
    "Tomato_Leaf_Mold",
    "Tomato_Septoria_leaf_spot",
    "Tomato_Spider_mites",
    "Tomato_Target_Spot",
    "Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato_mosaic_virus",
    "Tomato_healthy",
]

# Severity range per penyakit (min, max percent)
SEVERITY_RANGES = {
    "Tomato_Early_blight":          (20.0, 55.0),
    "Tomato_Bacterial_spot":        (30.0, 70.0),
    "Tomato_Late_blight":           (40.0, 85.0),
    "Tomato_Leaf_Mold":             (15.0, 45.0),
    "Tomato_Septoria_leaf_spot":    (10.0, 40.0),
    "Tomato_Spider_mites":          (20.0, 60.0),
    "Tomato_Target_Spot":           (25.0, 55.0),
    "Tomato_Yellow_Leaf_Curl_Virus":(50.0, 90.0),
    "Tomato_mosaic_virus":          (45.0, 80.0),
    "Tomato_healthy":               (0.0,  5.0),
}


def predict_disease(image_path: str) -> dict:
    """
    Prediksi penyakit tomat menggunakan model real.
    
    Jika model Keras tersedia di path MODEL_PATH dan file gambar valid,
    gunakan model TensorFlow. Jika ada error, fallback ke simulasi.
    """
    # Coba load model TensorFlow jika ada
    try:
        from app.core.config import settings
        
        # Validasi file gambar
        if not os.path.exists(image_path):
            logger.warning(f"Image file not found: {image_path}")
            return _predict_simulated(image_path)
        
        model_path = _resolve_backend_path(settings.MODEL_PATH)

        # Cek dan load model real
        if model_path.exists():
            logger.info(f"Loading model from: {model_path}")
            result = _predict_with_model(image_path, str(model_path))
            logger.info(f"Model prediction successful: {result['class_name']}")
            return result
        else:
            logger.warning(f"Model not found at: {model_path}, using simulated prediction")
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}", exc_info=True)

    # Fallback: simulasi realistis
    return _predict_simulated(image_path)


def _resolve_backend_path(path_value: str) -> Path:
    """Resolve relative backend paths consistently, regardless of server cwd."""
    path = Path(path_value)
    if path.is_absolute():
        return path
    return BACKEND_DIR / path


def _predict_simulated(image_path: str) -> dict:
    """
    Simulasi prediksi dengan distribusi probabilitas realistis.
    Tomat healthy punya peluang 30%, penyakit lain 70%.
    """
    # 30% kemungkinan healthy, 70% salah satu penyakit
    if random.random() < 0.30:
        class_name = "Tomato_healthy"
    else:
        # Pilih random dari penyakit (kecuali healthy)
        diseased = [c for c in DISEASE_CLASSES if c != "Tomato_healthy"]
        class_name = random.choice(diseased)

    # Confidence realistis (80-99%)
    confidence = round(random.uniform(0.80, 0.99), 4)

    # Severity berdasarkan range per penyakit
    sev_min, sev_max = SEVERITY_RANGES.get(class_name, (10.0, 50.0))
    severity = round(random.uniform(sev_min, sev_max), 2)

    return {
        "class_name": class_name,
        "confidence": confidence,
        "severity": severity,
        "notes": f"Simulasi AI - confidence {confidence*100:.1f}%",
    }


@lru_cache(maxsize=1)
def _load_model(model_path: str):
    import tensorflow as tf
    return tf.keras.models.load_model(model_path)


def _model_has_rescaling_layer(model) -> bool:
    if not model.layers:
        return False

    first_layer = model.layers[0]
    layer_name = first_layer.__class__.__name__.lower()
    config = first_layer.get_config()
    return layer_name == "rescaling" or "scale" in config


def _predict_with_model(image_path: str, model_path: str) -> dict:
    """
    Prediksi menggunakan model Keras yang sudah di-train.
    Otomatis diaktifkan jika file model tersedia.
    """
    import numpy as np
    try:
        import tensorflow as tf
    except ImportError:
        logger.error("TensorFlow not installed, falling back to simulated prediction")
        return _predict_simulated(image_path)

    try:
        model = _load_model(model_path)

        # Load dan preprocess gambar (224x224 untuk standard CNN).
        # Model ini sudah punya layer Rescaling(1./255), jadi jangan dibagi 255 dua kali.
        img = tf.keras.utils.load_img(image_path, target_size=(224, 224))
        img_array = tf.keras.utils.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        if not _model_has_rescaling_layer(model):
            img_array = img_array / 255.0

        # Predict
        predictions = model.predict(img_array, verbose=0)

        # Ambil class dengan confidence tertinggi
        class_idx = np.argmax(predictions[0])
        confidence = float(predictions[0][class_idx])
        class_name = DISEASE_CLASSES[class_idx] if class_idx < len(DISEASE_CLASSES) else "Tomato_healthy"

        # Hitung severity berdasarkan confidence dan range per penyakit
        sev_min, sev_max = SEVERITY_RANGES.get(class_name, (10.0, 50.0))
        severity = round((confidence * sev_max), 2)

        return {
            "class_name": class_name,
            "confidence": round(confidence, 4),
            "severity": severity,
            "notes": f"Prediksi model AI - confidence {confidence*100:.1f}%",
        }
    except Exception as e:
        logger.error(f"Error during model prediction: {str(e)}", exc_info=True)
        return _predict_simulated(image_path)
