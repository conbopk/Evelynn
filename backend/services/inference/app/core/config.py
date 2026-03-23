"""
Configuration management via pydantic-settings.
Values are read from environment variables (and .env file in dev).
"""

from functools import lru_cache
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", case_sensitive=True, extra="ignore")

    # -------------------------------------------------------------------------
    # App
    # -------------------------------------------------------------------------
    ENV: Literal["development", "testing", "production"] = "development"
    LOG_LEVEL: Literal["DEBUG", "INFO", "WARNING", "ERROR"] = "INFO"
    LOG_FORMAT: Literal["json", "console"] = "console"

    # -------------------------------------------------------------------------
    # Server
    # -------------------------------------------------------------------------
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    WORKERS: int = 1  # keep 1 — model is loaded in memory per worker

    # -------------------------------------------------------------------------
    # Auth
    # -------------------------------------------------------------------------
    # Comma-separated list of valid API keys.
    # Example: "key1,key2,key3"
    API_KEYS: str = Field(default="", description="Comma-separated API keys")

    @property
    def api_key_set(self) -> set[str]:
        return {k.strip() for k in self.API_KEYS.split(",") if k.strip()}

    # -------------------------------------------------------------------------
    # CORS
    # -------------------------------------------------------------------------
    # Comma-separated list of allowed origins.
    CORS_ORIGINS_STR: str = Field(default="*", alias="CORS_ORIGINS")

    @property
    def CORS_ORIGINS(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS_STR.split(",") if o.strip()]

    # -------------------------------------------------------------------------
    # Model
    # -------------------------------------------------------------------------
    MODEL_ID: str = "Tongyi-MAI/Z-Image-Turbo"
    HF_TOKEN: str | None = None
    PRELOAD_MODEL: bool = True

    # Default inference params
    DEFAULT_STEPS: int = 9
    DEFAULT_GUIDANCE_SCALE: float = 0.0
    DEFAULT_WIDTH: int = 1024
    DEFAULT_HEIGHT: int = 1024
    MAX_WIDTH: int = 2048
    MAX_HEIGHT: int = 2048

    # -------------------------------------------------------------------------
    # AWS S3
    # -------------------------------------------------------------------------
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_REGION: str = "us-east-1"
    AWS_S3_BUCKET_NAME: str = ""
    S3_KEY_PREFIX: str = "images"

    # -------------------------------------------------------------------------
    # HuggingFace Hub cache
    # -------------------------------------------------------------------------
    HF_HUB_CACHE: str = "/models"

    @field_validator("ENV", mode="before")
    @classmethod
    def normalize_env(cls, v: str) -> str:
        return v.lower().strip()


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings: Settings = get_settings()
