import asyncio
import logging
import uuid
from datetime import datetime, timedelta, timezone
from typing import Dict, Optional, Tuple, Set
from fastapi import WebSocket

from app.config.settings import get_settings
from app.models.session import RoomSession, SessionState
from app.security.otp import (
    generate_secure_otp,
    generate_salt,
    hash_otp,
    verify_otp_hash,
)

logger = logging.getLogger("sharewithotp.room_manager")


class RoomManager:
    """Thread-safe / asyncio-safe in-memory room and session manager.
    
    CRITICAL PRIVACY RULE:
    - Never stores file contents, chunks, or payloads.
    - Stores only temporary ephemeral transfer metadata.
    - Enforces automatic session expiration and immediate destruction after transfer.
    """

    def __init__(self):
        self._rooms: Dict[str, RoomSession] = {}
        # Map of room_id -> { "sender": WebSocket, "receiver": WebSocket }
        self._connections: Dict[str, Dict[str, WebSocket]] = {}
        self._lock = asyncio.Lock()

    async def create_room(self, room_id: str) -> Tuple[RoomSession, str]:
        """Create a new temporary room with cryptographically generated OTP.
        
        Returns:
            Tuple of (RoomSession, plaintext_otp_for_sender)
        """
        settings = get_settings()
        clean_room_id = room_id.strip().lower()

        async with self._lock:
            existing = self._rooms.get(clean_room_id)
            if existing:
                if existing.is_destroyed:
                    raise ValueError(f"Transfer session '{clean_room_id}' has already completed and been destroyed. Please use a new Room ID.")
                elif not existing.is_expired():
                    raise ValueError(f"Room ID '{clean_room_id}' is currently active. Please choose a different Room ID.")
                else:
                    # Clean up previously expired session
                    await self._purge_room_internal(clean_room_id)

            plaintext_otp = generate_secure_otp()
            salt = generate_salt()
            hashed_otp = hash_otp(plaintext_otp, salt)

            now = datetime.now(timezone.utc)
            expires_at = now + timedelta(seconds=settings.ROOM_EXPIRY_SECONDS)
            sender_token = str(uuid.uuid4())

            session = RoomSession(
                room_id=clean_room_id,
                sender_token=sender_token,
                otp_hash=hashed_otp,
                salt=salt,
                failed_attempts=0,
                state=SessionState.WAITING_FOR_RECEIVER,
                created_at=now,
                expires_at=expires_at,
            )

            self._rooms[clean_room_id] = session
            self._connections[clean_room_id] = {}
            logger.info(f"Created temporary room '{clean_room_id}' (expires at {expires_at.isoformat()})")
            return session, plaintext_otp

    async def get_room(self, room_id: str) -> Optional[RoomSession]:
        clean_room_id = room_id.strip().lower()
        async with self._lock:
            session = self._rooms.get(clean_room_id)
            if session and session.is_expired() and not session.is_destroyed:
                session.state = SessionState.EXPIRED
            return session

    async def verify_otp(
        self, room_id: str, otp: str
    ) -> Tuple[bool, Optional[str], SessionState, str, Optional[int]]:
        """Verify the 6-digit OTP for a receiver trying to join a room.
        
        Returns:
            (success, receiver_token, state, message, attempts_remaining)
        """
        settings = get_settings()
        clean_room_id = room_id.strip().lower()

        async with self._lock:
            session = self._rooms.get(clean_room_id)
            if not session:
                return False, None, SessionState.FAILED, "Room not found.", None

            if session.is_destroyed:
                return False, None, SessionState.DESTROYED, "This transfer session has ended and been destroyed.", None

            if session.is_expired():
                session.state = SessionState.EXPIRED
                return False, None, SessionState.EXPIRED, "This transfer room has expired.", None

            if session.state == SessionState.LOCKED or session.failed_attempts >= settings.MAX_OTP_ATTEMPTS:
                session.state = SessionState.LOCKED
                session.lock_reason = "Maximum OTP verification attempts exceeded."
                return False, None, SessionState.LOCKED, "SESSION LOCKED: Maximum OTP attempts exceeded.", 0

            if session.state not in (SessionState.CREATED, SessionState.WAITING_FOR_RECEIVER):
                if session.state == SessionState.RECEIVER_AUTHENTICATED or session.receiver_token:
                    return False, None, session.state, "A receiver is already authenticated to this room.", None
                return False, None, session.state, f"Invalid room state: {session.state.value}", None

            # Verify constant-time hash
            is_valid = verify_otp_hash(otp.strip(), session.salt, session.otp_hash)

            if not is_valid:
                session.failed_attempts += 1
                remaining = max(0, settings.MAX_OTP_ATTEMPTS - session.failed_attempts)
                if remaining == 0:
                    session.state = SessionState.LOCKED
                    session.lock_reason = "Maximum OTP verification attempts exceeded."
                    logger.warning(f"Room '{clean_room_id}' locked due to 5 consecutive failed OTP attempts.")
                    return False, None, SessionState.LOCKED, "SESSION LOCKED: Maximum OTP attempts exceeded.", 0

                logger.info(f"Invalid OTP attempt for room '{clean_room_id}'. Remaining: {remaining}")
                return False, None, session.state, f"Invalid OTP. {remaining} attempt(s) remaining.", remaining

            # Authentication successful!
            receiver_token = str(uuid.uuid4())
            session.receiver_token = receiver_token
            session.state = SessionState.RECEIVER_AUTHENTICATED

            # Invalidate OTP immediately so it cannot be reused
            session.otp_hash = ""
            session.salt = ""

            logger.info(f"Receiver authenticated successfully for room '{clean_room_id}'. OTP invalidated.")
            return True, receiver_token, session.state, "Identity verified.", None

    async def update_state(self, room_id: str, new_state: SessionState) -> None:
        clean_room_id = room_id.strip().lower()
        async with self._lock:
            session = self._rooms.get(clean_room_id)
            if session and not session.is_destroyed:
                session.state = new_state
                logger.info(f"Room '{clean_room_id}' transition to state {new_state.value}")

    async def register_connection(self, room_id: str, role: str, websocket: WebSocket) -> bool:
        clean_room_id = room_id.strip().lower()
        async with self._lock:
            if clean_room_id not in self._connections:
                self._connections[clean_room_id] = {}
            self._connections[clean_room_id][role] = websocket
            return True

    async def remove_connection(self, room_id: str, role: str) -> None:
        clean_room_id = room_id.strip().lower()
        async with self._lock:
            if clean_room_id in self._connections and role in self._connections[clean_room_id]:
                del self._connections[clean_room_id][role]

    async def get_peer_connection(self, room_id: str, current_role: str) -> Optional[WebSocket]:
        clean_room_id = room_id.strip().lower()
        peer_role = "receiver" if current_role == "sender" else "sender"
        async with self._lock:
            return self._connections.get(clean_room_id, {}).get(peer_role)

    async def destroy_room(self, room_id: str, reason: str = "transfer_completed") -> None:
        """Completely destroy room, close all WebSockets, invalidate credentials, and purge state."""
        clean_room_id = room_id.strip().lower()
        async with self._lock:
            await self._purge_room_internal(clean_room_id, reason)

    async def _purge_room_internal(self, clean_room_id: str, reason: str = "transfer_completed") -> None:
        session = self._rooms.get(clean_room_id)
        if session:
            session.is_destroyed = True
            session.state = SessionState.DESTROYED
            session.otp_hash = ""
            session.salt = ""

        # Close all active WebSocket signaling channels for this room
        room_conns = self._connections.pop(clean_room_id, {})
        for role, ws in room_conns.items():
            try:
                await ws.close(code=1000, reason=f"Room destroyed: {reason}")
            except Exception:
                pass

        logger.info(f"Room '{clean_room_id}' completely destroyed ({reason}).")

    async def cleanup_expired_rooms(self) -> int:
        """Scan and evict expired rooms."""
        now = datetime.now(timezone.utc)
        expired_ids = []

        async with self._lock:
            for room_id, session in self._rooms.items():
                if not session.is_destroyed and session.expires_at <= now:
                    expired_ids.append(room_id)

        count = len(expired_ids)
        for room_id in expired_ids:
            logger.info(f"Evicting expired room '{room_id}'")
            await self.destroy_room(room_id, reason="expired")

        return count


# Singleton instance
room_manager = RoomManager()
