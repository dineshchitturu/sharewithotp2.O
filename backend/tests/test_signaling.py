import pytest
from starlette.testclient import TestClient
from app.main import app
from app.services.room_manager import room_manager
from app.models.session import SessionState


@pytest.fixture(autouse=True)
def reset_room_manager():
    room_manager._rooms.clear()
    room_manager._connections.clear()
    yield


def test_signaling_unauthorized():
    client = TestClient(app)
    # Attempt connecting to non-existent room
    with pytest.raises(Exception):
        with client.websocket_connect("/ws/signaling/nosuchroom?role=sender&token=fake") as ws:
            pass


def test_signaling_relay_flow():
    client = TestClient(app)

    # 1. Create room
    create_resp = client.post("/api/rooms", json={"room_id": "webrtctest"})
    assert create_resp.status_code == 201
    room_data = create_resp.json()
    sender_token = room_data["sender_token"]
    otp = room_data["otp"]

    # 2. Verify OTP as receiver
    verify_resp = client.post("/api/rooms/webrtctest/verify", json={"otp": otp})
    assert verify_resp.status_code == 200
    receiver_token = verify_resp.json()["session_token"]

    # 3. Connect sender WebSocket
    with client.websocket_connect(
        f"/ws/signaling/webrtctest?role=sender&token={sender_token}"
    ) as sender_ws:
        sender_init = sender_ws.receive_json()
        assert sender_init["type"] == "connection-success"
        assert sender_init["role"] == "sender"

        # 4. Connect receiver WebSocket
        with client.websocket_connect(
            f"/ws/signaling/webrtctest?role=receiver&token={receiver_token}"
        ) as receiver_ws:
            receiver_init = receiver_ws.receive_json()
            assert receiver_init["type"] == "connection-success"
            assert receiver_init["role"] == "receiver"

            # Sender receives notification that receiver joined
            peer_joined_msg = sender_ws.receive_json()
            assert peer_joined_msg["type"] == "peer-joined"

            # Receiver receives notification that sender is connected
            peer_present_msg = receiver_ws.receive_json()
            assert peer_present_msg["type"] == "peer-joined"

            # 5. Sender sends SDP offer
            offer_payload = {"sdp": "v=0\r\no=...", "type": "offer"}
            sender_ws.send_json({"type": "offer", "payload": offer_payload})

            # Receiver receives relayed SDP offer
            received_offer = receiver_ws.receive_json()
            assert received_offer["type"] == "offer"
            assert received_offer["payload"] == offer_payload
            assert received_offer["sender_role"] == "sender"

            # 6. Receiver sends SDP answer
            answer_payload = {"sdp": "v=0\r\no=answer...", "type": "answer"}
            receiver_ws.send_json({"type": "answer", "payload": answer_payload})

            # Sender receives relayed SDP answer
            received_answer = sender_ws.receive_json()
            assert received_answer["type"] == "answer"
            assert received_answer["payload"] == answer_payload
            assert received_answer["sender_role"] == "receiver"

            # 7. Receiver sends transfer-complete
            receiver_ws.send_json({"type": "transfer-complete"})

            # Sender receives transfer-complete notification
            term_msg = sender_ws.receive_json()
            assert term_msg["type"] == "transfer-complete"

    # 8. Verify room has been completely purged from memory (no storage) and can be reused
    status_resp = client.get("/api/rooms/webrtctest/status")
    assert status_resp.status_code == 404

    recreate_resp = client.post("/api/rooms", json={"room_id": "webrtctest"})
    assert recreate_resp.status_code == 201
    assert recreate_resp.json()["room_id"] == "webrtctest"

