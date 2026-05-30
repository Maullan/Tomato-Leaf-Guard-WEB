# app/services/ai_service.py
import json
import random
import os
import logging
from functools import lru_cache
from pathlib import Path

logger = logging.getLogger(__name__)

BACKEND_DIR = Path(__file__).resolve().parents[2]
DEFAULT_MODEL_INPUT_SIZE = (224, 224)

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
    "Tidak_Terdefinisi",
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
    "Tomato_Yellow_Leaf_Curl_Virus": (50.0, 90.0),
    "Tomato_mosaic_virus":          (45.0, 80.0),
    "Tomato_healthy":               (0.0,  5.0),
    "Tidak_Terdefinisi":            (0.0,  0.0),
}


def predict_disease(image_path: str, processed_output_path: str | None = None) -> dict:
    """
    Prediksi penyakit tomat menggunakan model real.

    Jika model Keras tersedia di path MODEL_PATH dan file gambar valid,
    siapkan gambar sesuai kebutuhan model lalu gunakan TensorFlow.
    Jika ada error, fallback ke simulasi.
    """
    try:
        from app.core.config import settings

        # Validasi file gambar
        if not os.path.exists(image_path):
            logger.warning(f"Image file not found: {image_path}")
            return _predict_simulated(image_path)

        model_path = _resolve_backend_path(settings.MODEL_PATH)

        if model_path.exists():
            inference_path = _prepare_image_for_model(image_path, processed_output_path)
            result = _predict_with_model(inference_path, str(model_path))
            result["processed_image_path"] = inference_path
            result["used_background_removal"] = inference_path != image_path
            logger.info(f"Model prediction successful: {result['class_name']}")
            return result
        else:
            logger.warning(f"Model not found at: {model_path}, using simulated prediction")
    except Exception as e:
        logger.error(f"Error using model: {str(e)}", exc_info=True)

    # Fallback: simulasi realistis
    return _predict_simulated(image_path)


def _resolve_backend_path(path_value: str) -> Path:
    """Resolve relative backend paths consistently, regardless of server cwd."""
    path = Path(path_value)
    if path.is_absolute():
        return path
    return BACKEND_DIR / path


def _prepare_image_for_model(image_path: str, processed_output_path: str | None) -> str:
    from app.core.config import settings

    if not settings.REMOVE_BACKGROUND_ENABLED:
        return image_path

    if not processed_output_path:
        source = Path(image_path)
        processed_dir = _resolve_backend_path(settings.PROCESSED_UPLOAD_DIR)
        processed_output_path = str(processed_dir / f"{source.stem}_nobg.jpg")

    from app.services.background_service import remove_leaf_background

    return remove_leaf_background(image_path, processed_output_path)


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
        diseased = [
            c
            for c in DISEASE_CLASSES
            if c not in ("Tomato_healthy", "Tidak_Terdefinisi")
        ]
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
    logger.info(f"Loading model from: {model_path}")
    return tf.keras.models.load_model(model_path, compile=False)


def _model_has_rescaling_layer(model) -> bool:
    if not model.layers:
        return False

    first_layer = model.layers[0]
    layer_name = first_layer.__class__.__name__.lower()
    config = first_layer.get_config()
    return layer_name == "rescaling" or "scale" in config


def _get_configured_input_size() -> tuple[int, int]:
    try:
        from app.core.config import settings

        if settings.MODEL_INPUT_SIZE and settings.MODEL_INPUT_SIZE > 0:
            return (settings.MODEL_INPUT_SIZE, settings.MODEL_INPUT_SIZE)
    except Exception:
        pass

    return DEFAULT_MODEL_INPUT_SIZE


def _get_model_input_size(model) -> tuple[int, int]:
    shape = getattr(model, "input_shape", None)
    if isinstance(shape, list) and shape:
        shape = shape[0]

    if shape and len(shape) >= 4 and shape[1] and shape[2]:
        return (int(shape[1]), int(shape[2]))

    return _get_configured_input_size()


def _parse_class_names(raw_value: str | None) -> list[str] | None:
    if not raw_value:
        return None

    raw_value = raw_value.strip()
    if not raw_value:
        return None

    try:
        if raw_value.startswith("["):
            class_names = json.loads(raw_value)
        else:
            class_names = raw_value.split(",")
    except json.JSONDecodeError:
        logger.warning("MODEL_CLASS_NAMES is not valid JSON; falling back to comma parsing")
        class_names = raw_value.split(",")

    cleaned = [str(name).strip() for name in class_names if str(name).strip()]
    return cleaned or None


@lru_cache(maxsize=8)
def _get_model_class_names(output_count: int) -> list[str]:
    raw_class_names = None
    try:
        from app.core.config import settings

        raw_class_names = settings.MODEL_CLASS_NAMES
    except Exception:
        pass

    class_names = _parse_class_names(raw_class_names) or list(DISEASE_CLASSES)
    configured_count = len(class_names)

    if output_count > configured_count:
        logger.warning(
            "Model returns %s classes, but only %s class names are configured. "
            "Unconfigured outputs will use Unknown_Class_<index>.",
            output_count,
            configured_count,
        )
        class_names.extend(
            f"Unknown_Class_{index}"
            for index in range(configured_count, output_count)
        )
    elif output_count < configured_count:
        logger.warning(
            "Model returns %s classes, but %s class names are configured. "
            "Only the first %s labels can be predicted by this model.",
            output_count,
            configured_count,
            output_count,
        )

    return class_names


def _calculate_severity(class_name: str, confidence: float) -> float | None:
    if class_name.startswith("Unknown_Class_") or class_name == "Tidak_Terdefinisi":
        return None

    sev_min, sev_max = SEVERITY_RANGES.get(class_name, (10.0, 50.0))
    severity = sev_min + (confidence * (sev_max - sev_min))
    return round(severity, 2)


def _predict_with_model(image_path: str, model_path: str) -> dict:
    """
    Prediksi menggunakan model Keras yang sudah di-train.
    Otomatis diaktifkan jika file model tersedia.
    """
    import numpy as np
    try:
        import tensorflow as tf
    except ImportError as exc:
        raise RuntimeError("TensorFlow is not installed") from exc

    model = _load_model(model_path)
    target_size = _get_model_input_size(model)

    # Model yang punya Rescaling(1./255) tidak perlu dibagi 255 dua kali.
    img = tf.keras.utils.load_img(image_path, target_size=target_size)
    img_array = tf.keras.utils.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    if not _model_has_rescaling_layer(model):
        img_array = img_array / 255.0

    predictions = np.asarray(model.predict(img_array, verbose=0))
    scores = predictions[0] if predictions.ndim > 1 else predictions

    class_idx = int(np.argmax(scores))
    confidence = float(scores[class_idx])
    class_names = _get_model_class_names(len(scores))
    class_name = (
        class_names[class_idx]
        if class_idx < len(class_names)
        else f"Unknown_Class_{class_idx}"
    )
    severity = _calculate_severity(class_name, confidence)

    if class_name == "Tidak_Terdefinisi":
        notes = (
            "Foto tidak sesuai dengan semua class dataset model; "
            f"confidence {confidence*100:.1f}%"
        )
    elif class_name.startswith("Unknown_Class_"):
        notes = (
            f"Prediksi model AI - output index {class_idx} belum punya label; "
            f"confidence {confidence*100:.1f}%"
        )
    else:
        notes = f"Prediksi model AI - confidence {confidence*100:.1f}%"

    return {
        "class_name": class_name,
        "confidence": round(confidence, 4),
        "severity": severity,
        "notes": notes,
    }
