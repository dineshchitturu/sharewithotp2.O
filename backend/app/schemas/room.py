import re
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator
from app.models.session import SessionState


ROOM_ID_REGEX = re.compile(r"^[a-zA-Z0-9_-]{4,30}$")
OTP_REGEX = re.compile(r"^\d{6}$")


class CreateRoomRequest(BaseModel):
    room_id: str = Field(..., description="Temporary room identifier (4-30 alphanumeric characters, underscores or hyphens)")

    @field_validator("room_id")
    @classmethod
    def validate_room_id(cls, v: str) -> str:
        clean = v.strip().lower()
        if not ROOM_ID_REGEX.match(clean):
            raise ValueError(
                "Room ID must be between 4 and 30 characters and contain only letters, numbers, hyphens, and underscores."
            )
        return clean


class CreateRoomResponse(BaseModel):
    room_id: str
    otp: str = Field(..., description="Cryptographically secure 6-digit OTP (returned only once to creator)")
    sender_token: str = Field(..., description="Authentication token for sender signaling connection")
    expires_at: datetime
    status: SessionState = SessionState.WAITING_FOR_RECEIVER


class VerifyOTPRequest(BaseModel):
    otp: str = Field(..., description="6-digit OTP provided by sender")

    @field_validator("otp")
    @classmethod
    def validate_otp(cls, v: str) -> str:
        clean = v.strip()
        if not OTP_REGEX.match(clean):
            raise ValueError("OTP must be a 6-digit numeric code.")
        return clean


class VerifyOTPResponse(BaseModel):
    success: bool
    session_token: Optional[str] = None
    status: SessionState
    message: str
    attempts_remaining: Optional[int] = None


class RoomStatusResponse(BaseModel):
    room_id: str
    status: SessionState
    expires_at: datetime
    created_at: datetime
