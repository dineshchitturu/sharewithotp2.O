from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class SignalingMessage(BaseModel):
    """Schema for WebRTC signaling messages relayed over WebSocket.
    
    CRITICAL: File chunks or binary file payload must NEVER be relayed through signaling.
    """
    type: str = Field(..., description="Message type: offer, answer, ice-candidate, join, state-update, complete, cancel")
    payload: Optional[Dict[str, Any]] = Field(default=None, description="Signaling metadata (SDP, ICE candidate object, etc.)")
    sender_role: Optional[str] = Field(default=None, description="'sender' or 'receiver'")
    timestamp: Optional[float] = Field(default=None)
