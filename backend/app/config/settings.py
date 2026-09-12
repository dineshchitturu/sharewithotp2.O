import os
from functools import lru_cache
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application runtime configuration loaded from environment variables."""

    # Transfer & Session Lifecycles
    ROOM_EXPIRY_SECONDS: int = 900  # 15 minutes default
    OTP_EXPIRY_SECONDS: int = 900
    MAX_OTP_ATTEMPTS: int = 5
    CLEANUP_INTERVAL_SECONDS: int = 30

    # Security
    JWT_SECRET: str = "temporary-p2p-session-secret-change-in-prod"

    # CORS origins for frontend access
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # WebRTC ICE Server Configurations (STUN / TURN)
    STUN_SERVER_URL: str = "stun:stun.l.google.com:19302"
    TURN_SERVER_URL: str = ""
    TURN_USERNAME: str = ""
    TURN_CREDENTIAL: str = ""

    # P2P Chunk configuration recommended defaults
    DEFAULT_CHUNK_SIZE: int = 65536  # 64 KB

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


@lru_cache()
def get_settings() -> Settings:
    return Settings()
