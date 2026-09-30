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
        "https://sharewithotp2-o-1.onrender.com",
        "https://sharewithotp2-o.onrender.com",
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
        env_file=(".env", "backend/.env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


@lru_cache()
def get_settings() -> Settings:
    return Settings()


def get_default_ice_servers() -> List[dict]:
    """Build multi-provider, multi-port ICE server configuration (STUN + TURN relays).
    
    Guarantees reliable WebRTC connection whether peers are on the same local network,
    behind Symmetric NATs, on mobile cellular (4G/5G) hotspots, or restrictive firewalls.
    """
    settings = get_settings()

    # 1. Multi-provider, multi-port STUN servers (UDP & TLS ports 19302, 3478, 443)
    stun_candidates = [
        settings.STUN_SERVER_URL,
        "stun:stun.l.google.com:19302",
        "stun:stun1.l.google.com:19302",
        "stun:stun2.l.google.com:19302",
        "stun:stun3.l.google.com:19302",
        "stun:stun4.l.google.com:19302",
        "stun:stun.cloudflare.com:3478",
        "stun:global.stun.twilio.com:3478",
        "stun:stun.nextcloud.com:443",
        "stun:stun.nextcloud.com:3478",
        "stun:stun.matrix.org:3478",
        "stun:stun.services.mozilla.com:3478",
    ]
    seen_stun = set()
    unique_stun_urls: List[str] = []
    for url in stun_candidates:
        if url and url not in seen_stun:
            seen_stun.add(url)
            unique_stun_urls.append(url)

    ice_servers: List[dict] = [{"urls": unique_stun_urls}]

    # 2. Configured TURN server from environment if specified
    if settings.TURN_SERVER_URL:
        turn_urls = []
        for u in settings.TURN_SERVER_URL.split(","):
            clean_u = u.strip()
            if not clean_u:
                continue
            if not clean_u.startswith("turn:") and not clean_u.startswith("turns:"):
                clean_u = f"turn:{clean_u}"
            turn_urls.append(clean_u)

        if turn_urls:
            turn_entry: dict = {"urls": turn_urls}
            if settings.TURN_USERNAME:
                turn_entry["username"] = settings.TURN_USERNAME
            if settings.TURN_CREDENTIAL:
                turn_entry["credential"] = settings.TURN_CREDENTIAL
            ice_servers.append(turn_entry)

    return ice_servers

