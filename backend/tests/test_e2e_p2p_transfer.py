import asyncio
import hashlib
import json
import os
import pytest
from starlette.testclient import TestClient
from aiortc import RTCPeerConnection, RTCSessionDescription, RTCIceCandidate
from app.main import app
from app.services.room_manager import room_manager
from app.models.session import SessionState


@pytest.fixture(autouse=True)
def reset_room_mgr():
    room_manager.reset()
    yield


@pytest.mark.asyncio
async def test_p2p_streaming_integrity():
    """Verify end-to-end P2P DataChannel chunk streaming, backpressure, and SHA-256 verification."""
    client = TestClient(app)

    # 1. Create Room
    create_resp = client.post("/api/rooms", json={"room_id": "testp2p"})
    assert create_resp.status_code == 201
    room_data = create_resp.json()
    sender_token = room_data["sender_token"]
    otp = room_data["otp"]

    # 2. Verify OTP as receiver
    verify_resp = client.post("/api/rooms/testp2p/verify", json={"otp": otp})
    assert verify_resp.status_code == 200
    receiver_token = verify_resp.json()["session_token"]

    # 3. Create aiortc PeerConnections
    pc_sender = RTCPeerConnection()
    pc_receiver = RTCPeerConnection()

    channel_received_future = asyncio.get_event_loop().create_future()
    receiver_chunks = []
    receiver_complete_future = asyncio.get_event_loop().create_future()

    @pc_receiver.on("datachannel")
    def on_datachannel(channel):
        channel_received_future.set_result(channel)

        @channel.on("message")
        def on_message(message):
            if isinstance(message, str):
                msg = json.loads(message)
                if msg.get("type") == "transfer_trailer":
                    receiver_complete_future.set_result(True)
            elif isinstance(message, bytes):
                receiver_chunks.append(message)

    # Sender creates DataChannel
    sender_channel = pc_sender.createDataChannel("fileTransfer")
    sender_open_future = asyncio.get_event_loop().create_future()

    @sender_channel.on("open")
    def on_open():
        sender_open_future.set_result(True)

    # 4. Connect WebSockets and relay SDP offer/answer
    with client.websocket_connect(f"/ws/signaling/testp2p?role=sender&token={sender_token}") as sender_ws:
        sender_init = sender_ws.receive_json()
        assert sender_init["type"] == "connection-success"

        with client.websocket_connect(f"/ws/signaling/testp2p?role=receiver&token={receiver_token}") as receiver_ws:
            receiver_init = receiver_ws.receive_json()
            assert receiver_init["type"] == "connection-success"

            # Drain peer-joined
            sender_ws.receive_json()
            receiver_ws.receive_json()

            # Create offer
            offer = await pc_sender.createOffer()
            await pc_sender.setLocalDescription(offer)

            sender_ws.send_json({
                "type": "offer",
                "payload": {"sdp": pc_sender.localDescription.sdp, "type": pc_sender.localDescription.type}
            })

            # Receiver gets offer
            rx_offer = receiver_ws.receive_json()
            assert rx_offer["type"] == "offer"

            # Receiver sets remote and creates answer
            await pc_receiver.setRemoteDescription(
                RTCSessionDescription(sdp=rx_offer["payload"]["sdp"], type=rx_offer["payload"]["type"])
            )
            answer = await pc_receiver.createAnswer()
            await pc_receiver.setLocalDescription(answer)

            receiver_ws.send_json({
                "type": "answer",
                "payload": {"sdp": pc_receiver.localDescription.sdp, "type": pc_receiver.localDescription.type}
            })

            # Sender gets answer
            rx_answer = sender_ws.receive_json()
            assert rx_answer["type"] == "answer"

            await pc_sender.setRemoteDescription(
                RTCSessionDescription(sdp=rx_answer["payload"]["sdp"], type=rx_answer["payload"]["type"])
            )

    # Wait for DataChannel to open on both peers
    await asyncio.wait_for(sender_open_future, timeout=5.0)
    rx_channel = await asyncio.wait_for(channel_received_future, timeout=5.0)
    assert sender_channel.readyState == "open"
    assert rx_channel.readyState == "open"

    # 5. Stream 2 MB in 63 KB wire slices with SHA-256 calculation
    total_size = 2 * 1024 * 1024  # 2 MB
    slice_size = 64512  # 63 KB
    test_data = os.urandom(total_size)
    expected_hash = hashlib.sha256(test_data).hexdigest()

    # Send header
    sender_channel.send(json.dumps({
        "type": "transfer_header",
        "metadata": {
            "name": "large_test.dat",
            "size": total_size,
            "type": "application/octet-stream",
            "totalChunks": 2,
            "chunkSize": 1024 * 1024,
        }
    }))
    await asyncio.sleep(0.05)

    # Stream slices
    for offset in range(0, total_size, slice_size):
        chunk = test_data[offset:offset + slice_size]
        sender_channel.send(chunk)
        await asyncio.sleep(0.005)

    # Send trailer
    sender_channel.send(json.dumps({
        "type": "transfer_trailer",
        "hash": expected_hash,
    }))

    # Wait for receiver to finish
    await asyncio.wait_for(receiver_complete_future, timeout=30.0)

    # Verify data integrity
    received_bytes = b"".join(receiver_chunks)
    assert len(received_bytes) == total_size
    actual_hash = hashlib.sha256(received_bytes).hexdigest()
    assert actual_hash == expected_hash

    # Clean up PeerConnections
    await pc_sender.close()
    await pc_receiver.close()
