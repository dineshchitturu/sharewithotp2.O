from datetime import datetime, timezone
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class SessionState(str, Enum):
    CREATED = "CREATED"
    WAITING_FOR_RECEIVER = "WAITING_FOR_RECEIVER"
    RECEIVER_AUTHENTICATED = "RECEIVER_AUTHENTICATED"
    SIGNALING = "SIGNALING"
    CONNECTING = "CONNECTING"
    CONNECTED = "CONNECTED"
    TRANSFERRING = "TRANSFERRING"
    VERIFYING = "VERIFYING"
    COMPLETED = "COMPLETED"
    DESTROYED = "DESTROYED"
    CANCELLED = "CANCELLED"
    EXPIRED = "EXPIRED"
    FAILED = "FAILED"
    DISCONNECTED = "DISCONNECTED"
    LOCKED = "LOCKED"


class RoomSession(BaseModel):
    """Temporary in-memory transfer room session metadata.
    
    IMPORTANT: Never stores file data, chunks, contents, or permanent user identities.
    """
    room_id: str
    sender_token: str
    receiver_token: Optional[str] = None
    otp_hash: str  # Salted SHA-256 hash of OTP
    salt: str
    failed_attempts: int = 0
    state: SessionState = SessionState.CREATED
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: datetime
    is_destroyed: bool = False
    lock_reason: Optional[str] = None

    def is_expired(self) -> bool:
        return datetime.now(timezone.utc) >= self.expires_at

    def is_active(self) -> bool:
        return not self.is_destroyed and not self.is_expired() and self.state not in (
            SessionState.DESTROYED,
            SessionState.EXPIRED,
            SessionState.COMPLETED,
            SessionState.CANCELLED,
            SessionState.LOCKED
        )
