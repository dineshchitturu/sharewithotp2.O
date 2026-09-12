import hashlib
import hmac
import secrets


def generate_secure_otp() -> str:
    """Generate a cryptographically secure 6-digit numeric OTP (100000 - 999999)."""
    # secrets.randbelow is cryptographically secure (uses os.urandom / SystemRandom)
    return str(secrets.randbelow(900000) + 100000)


def generate_salt() -> str:
    """Generate a 32-character cryptographic hex salt."""
    return secrets.token_hex(16)


def hash_otp(otp: str, salt: str) -> str:
    """Compute salted SHA-256 hash of the OTP."""
    data = f"{otp}:{salt}".encode("utf-8")
    return hashlib.sha256(data).hexdigest()


def verify_otp_hash(otp: str, salt: str, expected_hash: str) -> bool:
    """Verify an input OTP against its salted SHA-256 hash using constant-time comparison."""
    computed_hash = hash_otp(otp, salt)
    return hmac.compare_digest(computed_hash, expected_hash)
