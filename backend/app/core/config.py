# app/core/config.py
from pydantic_settings import BaseSettings
from functools import lru_cache
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    # --- Info Aplikasi ---
    APP_NAME: str = "Tomato-LeafGuard API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # --- Database ---
    DATABASE_URL: str

    # --- JWT Authentication ---
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # --- Upload File ---
    MAX_UPLOAD_SIZE_MB: int = 5
    ALLOWED_EXTENSIONS: list[str] = ["jpg", "jpeg", "png", "webp"]
    UPLOAD_DIR: str = "uploads"

    # --- AI Model ---
    MODEL_PATH: str = "ai_model/model_tomato_leaf_guardai.keras"

    @classmethod
    def settings_customise_sources(
        cls,
        settings_cls,
        init_settings,
        env_settings,
        dotenv_settings,
        file_secret_settings,
    ):
        return (init_settings, dotenv_settings, env_settings, file_secret_settings)

    class Config:
        env_file = str(BACKEND_DIR / ".env")
        env_file_encoding = "utf-8"


# Pakai lru_cache supaya Settings hanya dibuat sekali (singleton)
@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
