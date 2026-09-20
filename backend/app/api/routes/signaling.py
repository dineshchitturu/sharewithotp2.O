import json
import logging
from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect, status
from app.models.session import SessionState
from app.schemas.signaling import SignalingMessage
from app.services.room_manager import room_manager

logger = logging.getLogger("sharewithotp.signaling")

router = APIRouter(tags=["Signaling"])


@router.websocket("/ws/signaling/{room_id}")
async def websocket_signaling_endpoint(
    websocket: WebSocket,
    room_id: str,
    role: str = Query(..., pattern="^(sender|receiver)$"),
    token: str = Query(...),
):
    """WebRTC signaling relay WebSocket endpoint.
    
    IMPORTANT ARCHITECTURAL RULE:
    - Only relays signaling messages (SDP offer/answer, ICE candidates, state events).
    - Under NO circumstances allows binary or chunk file data to pass through.
    """
    clean_room_id = room_id.strip().lower()
    session = await room_manager.get_room(clean_room_id)

    if not session:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Room not found.")
        return

    if session.is_destroyed or session.is_expired():
        await websocket.close(
            code=status.WS_1008_POLICY_VIOLATION,
            reason="This transfer session has ended or expired."
        )
        return

    # Validate role token
    if role == "sender" and token != session.sender_token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Invalid sender token.")
        return

    if role == "receiver":
        if not session.receiver_token or token != session.receiver_token:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Invalid receiver token.")
            return

    # Accept WebSocket connection
    await websocket.accept()
    await room_manager.register_connection(clean_room_id, role, websocket)
    logger.info(f"WebSocket connected for room '{clean_room_id}' with role '{role}'")

    # Send initial connection success confirmation
    await websocket.send_text(
        json.dumps({
            "type": "connection-success",
            "role": role,
            "room_id": clean_room_id,
            "status": session.state.value,
        })
    )

    # Notify peer if both are present
    peer_ws = await room_manager.get_peer_connection(clean_room_id, role)
    if peer_ws:
        await room_manager.update_state(clean_room_id, SessionState.SIGNALING)
        try:
            # Inform peer that a counterpart has connected
            await peer_ws.send_text(
                json.dumps({
                    "type": "peer-joined",
                    "role": role,
                })
            )
            # Inform this client that peer is already waiting
            peer_role = "receiver" if role == "sender" else "sender"
            await websocket.send_text(
                json.dumps({
                    "type": "peer-joined",
                    "role": peer_role,
                })
            )
        except Exception as e:
            logger.warning(f"Failed to notify peer about join in room '{clean_room_id}': {e}")

    try:
        while True:
            # Receive text frame (never accept binary frames here to guarantee zero file transfer via WS)
            message_text = await websocket.receive_text()

            try:
                data = json.loads(message_text)
            except json.JSONDecodeError:
                await websocket.send_text(
                    json.dumps({"type": "error", "message": "Invalid JSON format."})
                )
                continue

            msg_type = data.get("type")

            # Heartbeat ping/pong
            if msg_type == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
                continue

            # Handle transfer completion
            if msg_type == "transfer-complete":
                logger.info(f"Transfer completed in room '{clean_room_id}'. Triggering session destruction.")
                await room_manager.update_state(clean_room_id, SessionState.COMPLETED)
                peer_ws = await room_manager.get_peer_connection(clean_room_id, role)
                if peer_ws:
                    try:
                        await peer_ws.send_text(
                            json.dumps({"type": "transfer-complete"})
                        )
                    except Exception:
                        pass
                # Destroy room completely
                await room_manager.destroy_room(clean_room_id, reason="transfer_complete")
                break

            # Handle transfer cancellation
            if msg_type == "transfer-cancelled":
                reason = data.get("reason", "Cancelled by peer")
                logger.info(f"Transfer cancelled in room '{clean_room_id}': {reason}")
                await room_manager.update_state(clean_room_id, SessionState.CANCELLED)
                peer_ws = await room_manager.get_peer_connection(clean_room_id, role)
                if peer_ws:
                    try:
                        await peer_ws.send_text(
                            json.dumps({"type": "transfer-cancelled", "reason": reason})
                        )
                    except Exception:
                        pass
                await room_manager.destroy_room(clean_room_id, reason="transfer_cancelled")
                break

            # Handle state updates (e.g. CONNECTING, CONNECTED, TRANSFERRING, VERIFYING)
            if msg_type == "state-update":
                new_state = data.get("state")
                if new_state in SessionState.__members__:
                    await room_manager.update_state(clean_room_id, SessionState[new_state])
                # Relay state update to peer
                peer_ws = await room_manager.get_peer_connection(clean_room_id, role)
                if peer_ws:
                    try:
                        await peer_ws.send_text(json.dumps(data))
                    except Exception:
                        pass
                continue

            # WebRTC signaling relay: offer, answer, ice-candidate, request-offer
            if msg_type in ("offer", "answer", "ice-candidate", "request-offer"):
                peer_ws = await room_manager.get_peer_connection(clean_room_id, role)
                if peer_ws:
                    # Append sender metadata and relay to peer
                    data["sender_role"] = role
                    await peer_ws.send_text(json.dumps(data))
                else:
                    logger.debug(f"Peer not connected for room '{clean_room_id}' to relay '{msg_type}'")
            else:
                logger.debug(f"Unknown signaling message type '{msg_type}' in room '{clean_room_id}'")

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: role='{role}', room='{clean_room_id}'")
    except Exception as e:
        logger.error(f"Error in signaling WebSocket loop for room '{clean_room_id}': {e}")
    finally:
        await room_manager.remove_connection(clean_room_id, role)
        # Inform peer if still connected
        peer_ws = await room_manager.get_peer_connection(clean_room_id, role)
        if peer_ws:
            try:
                await peer_ws.send_text(
                    json.dumps({"type": "peer-left", "role": role})
                )
            except Exception:
                pass
