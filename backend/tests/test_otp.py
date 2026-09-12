import pytest
from app.security.otp import (
    generate_secure_otp,
    generate_salt,
    hash_otp,
    verify_otp_hash,
)
from app.security.rate_limit import InMemoryRateLimiter


def test_generate_secure_otp():
    """Verify OTP is a 6-digit numeric string within 100000..999999."""
    for _ in range(100):
        otp = generate_secure_otp()
        assert len(otp) == 6
        assert otp.isdigit()
        assert 100000 <= int(otp) <= 999999


def test_hash_and_verify_otp():
    """Verify OTP salted hashing and constant-time verification."""
    otp = "583921"
    salt = generate_salt()
    otp_hash = hash_otp(otp, salt)

    assert len(salt) == 32
    assert len(otp_hash) == 64  # SHA-256 hex length
    assert otp_hash != otp  # Never plaintext

    # Positive verification
    assert verify_otp_hash("583921", salt, otp_hash) is True

    # Negative verification
    assert verify_otp_hash("000000", salt, otp_hash) is False
    assert verify_otp_hash("583922", salt, otp_hash) is False
    assert verify_otp_hash("", salt, otp_hash) is False


def test_rate_limiter():
    """Verify sliding-window rate limiter blocks excessive requests."""
    limiter = InMemoryRateLimiter(max_requests=3, window_seconds=10)
    key = "test_ip_1"

    assert limiter.is_allowed(key) is True
    assert limiter.is_allowed(key) is True
    assert limiter.is_allowed(key) is True
    assert limiter.is_allowed(key) is False  # 4th request blocked

    limiter.reset(key)
    assert limiter.is_allowed(key) is True
