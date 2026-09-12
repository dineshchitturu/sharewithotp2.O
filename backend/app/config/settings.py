import json
import os
from functools import lru_cache
from typing import Any, List
from pydantic import field_validator
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

    # CORS origins for frontend access (supports JSON array or comma-separated list or '*')
    CORS_ORIGINS: Any = [
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

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: Any) -> List[str]:
        if isinstance(v, str):
            clean = v.strip()
            if clean == "*":
                return ["*"]
            if clean.startswith("[") and clean.endswith("]"):
                try:
                    return json.loads(clean)
                except Exception:
                    pass
            return [item.strip() for item in clean.split(",") if item.strip()]
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


@lru_cache()
def get_settings() -> Settings:
    return Settings()
