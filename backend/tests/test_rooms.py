import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.services.room_manager import room_manager
from app.models.session import SessionState


@pytest.fixture(autouse=True)
def reset_room_manager():
    """Ensure clean room state before each test."""
    room_manager._rooms.clear()
    room_manager._connections.clear()
    yield


@pytest.mark.asyncio
async def test_create_room_success():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post("/api/rooms", json={"room_id": "testroom1"})
        assert resp.status_code == 201
        data = resp.json()
        assert data["room_id"] == "testroom1"
        assert len(data["otp"]) == 6
        assert data["otp"].isdigit()
        assert "sender_token" in data
        assert data["status"] == SessionState.WAITING_FOR_RECEIVER


@pytest.mark.asyncio
async def test_create_room_invalid_id():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Too short (< 4 chars)
        resp = await client.post("/api/rooms", json={"room_id": "abc"})
        assert resp.status_code == 422

        # Invalid characters (space, punctuation)
        resp = await client.post("/api/rooms", json={"room_id": "test room!"})
        assert resp.status_code == 422


@pytest.mark.asyncio
async def test_duplicate_active_room_collision():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp1 = await client.post("/api/rooms", json={"room_id": "dinesh123"})
        assert resp1.status_code == 201

        resp2 = await client.post("/api/rooms", json={"room_id": "dinesh123"})
        assert resp2.status_code == 409
        assert "currently active" in resp2.json()["detail"]


@pytest.mark.asyncio
async def test_verify_otp_flow_and_lockout():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Create room
        create_resp = await client.post("/api/rooms", json={"room_id": "roomsecure"})
        assert create_resp.status_code == 201
        room_data = create_resp.json()
        correct_otp = room_data["otp"]

        # 1. Test incorrect OTP attempts
        for attempt in range(1, 5):
            resp = await client.post(
                "/api/rooms/roomsecure/verify",
                json={"otp": "000000"},
            )
            assert resp.status_code == 200
            res_data = resp.json()
            assert res_data["success"] is False
            assert res_data["attempts_remaining"] == 5 - attempt

        # 5th failed attempt triggers LOCK
        lock_resp = await client.post(
            "/api/rooms/roomsecure/verify",
            json={"otp": "000000"},
        )
        assert lock_resp.status_code == 423
        assert "SESSION LOCKED" in lock_resp.json()["detail"]

        # Even with correct OTP, it is now locked
        after_lock = await client.post(
            "/api/rooms/roomsecure/verify",
            json={"otp": correct_otp},
        )
        assert after_lock.status_code == 423


@pytest.mark.asyncio
async def test_successful_otp_verification_and_invalidation():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        create_resp = await client.post("/api/rooms", json={"room_id": "roomsuccess"})
        assert create_resp.status_code == 201
        room_data = create_resp.json()
        correct_otp = room_data["otp"]

        # Verify with correct OTP
        verify_resp = await client.post(
            "/api/rooms/roomsuccess/verify",
            json={"otp": correct_otp},
        )
        assert verify_resp.status_code == 200
        verify_data = verify_resp.json()
        assert verify_data["success"] is True
        assert verify_data["status"] == SessionState.RECEIVER_AUTHENTICATED
        assert "session_token" in verify_data
        receiver_token = verify_data["session_token"]
        assert receiver_token is not None

        # Verify OTP is now invalidated and cannot be reused
        reused_resp = await client.post(
            "/api/rooms/roomsuccess/verify",
            json={"otp": correct_otp},
        )
        assert reused_resp.status_code == 200
        reused_data = reused_resp.json()
        assert reused_data["success"] is False
        assert "already authenticated" in reused_data["message"]


@pytest.mark.asyncio
async def test_room_reuse_after_destroy():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Create room
        resp1 = await client.post("/api/rooms", json={"room_id": "reusableroom"})
        assert resp1.status_code == 201
        sender_token = resp1.json()["sender_token"]

        # Destroy room
        destroy_resp = await client.post(
            "/api/rooms/reusableroom/destroy",
            params={"token": sender_token},
        )
        assert destroy_resp.status_code == 200

        # Now recreate the same room ID - it should succeed cleanly without "already destroyed" error
        resp2 = await client.post("/api/rooms", json={"room_id": "reusableroom"})
        assert resp2.status_code == 201
        assert resp2.json()["room_id"] == "reusableroom"


@pytest.mark.asyncio
async def test_create_room_auto_otp():
    """Verify that creating a room with no room_id auto-generates a 6-digit OTP as room_id."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Request with empty body
        resp = await client.post("/api/rooms", json={})
        assert resp.status_code == 201
        data = resp.json()
        assert len(data["room_id"]) == 6
        assert data["room_id"].isdigit()
        assert data["room_id"] == data["otp"]
        assert "sender_token" in data
        assert data["status"] == SessionState.WAITING_FOR_RECEIVER

        # Verify with the auto-generated code
        verify_resp = await client.post(
            f"/api/rooms/{data['room_id']}/verify",
            json={"otp": data["otp"]},
        )
        assert verify_resp.status_code == 200
        assert verify_resp.json()["success"] is True


@pytest.mark.asyncio
async def test_ice_servers_in_room_endpoints():
    """Verify that ice-servers endpoint, create_room, and verify_room_otp include ice_servers."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Check /api/rooms/ice-servers
        ice_resp = await client.get("/api/rooms/ice-servers")
        assert ice_resp.status_code == 200
        ice_data = ice_resp.json()
        assert "ice_servers" in ice_data
        assert len(ice_data["ice_servers"]) >= 1

        # Check create_room returns ice_servers
        create_resp = await client.post("/api/rooms", json={})
        assert create_resp.status_code == 201
        create_data = create_resp.json()
        assert "ice_servers" in create_data
        assert create_data["ice_servers"] is not None

        # Check verify returns ice_servers
        verify_resp = await client.post(
            f"/api/rooms/{create_data['room_id']}/verify",
            json={"otp": create_data["otp"]},
        )
        assert verify_resp.status_code == 200
        verify_data = verify_resp.json()
        assert "ice_servers" in verify_data
        assert verify_data["ice_servers"] is not None


def test_turn_env_configuration(monkeypatch):
    """Verify that TURN credentials set via environment variables are loaded and formatted."""
    from app.config.settings import get_settings, get_default_ice_servers

    monkeypatch.setenv("TURN_SERVER_URL", "relay.example.com:3478,turn:relay.example.com:443?transport=tcp")
    monkeypatch.setenv("TURN_USERNAME", "testuser")
    monkeypatch.setenv("TURN_CREDENTIAL", "testpass")

    get_settings.cache_clear()
    servers = get_default_ice_servers()

    # Find the TURN server entry
    turn_entries = [s for s in servers if "username" in s and s["username"] == "testuser"]
    assert len(turn_entries) == 1
    turn_entry = turn_entries[0]
    assert turn_entry["credential"] == "testpass"
    assert "turn:relay.example.com:3478" in turn_entry["urls"]
    assert "turn:relay.example.com:443?transport=tcp" in turn_entry["urls"]

    get_settings.cache_clear()


@pytest.mark.asyncio
async def test_cors_production_frontend_origin():
    """Verify that OPTIONS preflight and requests from production frontend origin are allowed by CORS."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Preflight OPTIONS request
        options_resp = await client.options(
            "/api/rooms",
            headers={
                "Origin": "https://sharewithotp2-o-1.onrender.com",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type",
            },
        )
        assert options_resp.status_code == 200
        assert options_resp.headers.get("access-control-allow-origin") == "https://sharewithotp2-o-1.onrender.com"

        # Actual POST request
        post_resp = await client.post(
            "/api/rooms",
            json={},
            headers={"Origin": "https://sharewithotp2-o-1.onrender.com"},
        )
        assert post_resp.status_code == 201
        assert post_resp.headers.get("access-control-allow-origin") == "https://sharewithotp2-o-1.onrender.com"




