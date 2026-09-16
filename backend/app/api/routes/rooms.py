from typing import Optional
from fastapi import APIRouter, HTTPException, Request, status
from app.models.session import SessionState
from app.schemas.room import (
    CreateRoomRequest,
    CreateRoomResponse,
    VerifyOTPRequest,
    VerifyOTPResponse,
    RoomStatusResponse,
)
from app.security.rate_limit import otp_rate_limiter
from app.services.room_manager import room_manager

router = APIRouter(prefix="/api/rooms", tags=["Rooms"])


@router.post("", response_model=CreateRoomResponse, status_code=status.HTTP_201_CREATED)
async def create_room(req: Optional[CreateRoomRequest] = None):
    """Create a new temporary transfer room.
    
    Generates a cryptographically secure 6-digit OTP, stores only the salted hash,
    and returns the room metadata along with the one-time OTP for the sender.
    """
    room_id = req.room_id if req else None
    try:
        session, plaintext_otp = await room_manager.create_room(room_id)
        return CreateRoomResponse(
            room_id=session.room_id,
            otp=plaintext_otp,
            sender_token=session.sender_token,
            expires_at=session.expires_at,
            status=session.state,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create temporary transfer room."
        )


@router.post("/{room_id}/verify", response_model=VerifyOTPResponse)
async def verify_room_otp(room_id: str, req: VerifyOTPRequest, request: Request):
    """Verify receiver's 6-digit OTP to join a temporary transfer room."""
    client_ip = request.client.host if request.client else "unknown"
    rate_key = f"{client_ip}:{room_id.strip().lower()}"

    if not otp_rate_limiter.is_allowed(rate_key):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many verification attempts. Please wait before retrying."
        )

    success, receiver_token, state, message, remaining = await room_manager.verify_otp(
        room_id, req.otp
    )

    if not success:
        if state == SessionState.LOCKED:
            raise HTTPException(status_code=status.HTTP_423_LOCKED, detail=message)
        elif state == SessionState.DESTROYED:
            raise HTTPException(status_code=status.HTTP_410_GONE, detail=message)
        elif state == SessionState.EXPIRED:
            raise HTTPException(status_code=status.HTTP_410_GONE, detail=message)
        elif state == SessionState.FAILED:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=message)
        else:
            return VerifyOTPResponse(
                success=False,
                session_token=None,
                status=state,
                message=message,
                attempts_remaining=remaining,
            )

    return VerifyOTPResponse(
        success=True,
        session_token=receiver_token,
        status=state,
        message=message,
        attempts_remaining=None,
    )


@router.get("/{room_id}/status", response_model=RoomStatusResponse)
async def get_room_status(room_id: str):
    """Get public lifecycle status of a temporary transfer room."""
    session = await room_manager.get_room(room_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found.")

    return RoomStatusResponse(
        room_id=session.room_id,
        status=session.state,
        expires_at=session.expires_at,
        created_at=session.created_at,
    )


@router.post("/{room_id}/destroy")
async def destroy_room(room_id: str, token: str):
    """Explicitly destroy a temporary transfer room."""
    session = await room_manager.get_room(room_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Room not found.")

    if token not in (session.sender_token, session.receiver_token):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid session token.")

    await room_manager.destroy_room(room_id, reason="user_requested")
    return {"success": True, "message": "Room destroyed successfully."}
