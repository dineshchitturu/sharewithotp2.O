import time
from collections import defaultdict
from typing import Dict, List


class InMemoryRateLimiter:
    """Simple sliding-window rate limiter for brute-force prevention on OTP verification."""

    def __init__(self, max_requests: int = 10, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._requests: Dict[str, List[float]] = defaultdict(list)

    def is_allowed(self, key: str) -> bool:
        now = time.time()
        window_start = now - self.window_seconds

        # Prune older entries
        self._requests[key] = [t for t in self._requests[key] if t > window_start]

        if len(self._requests[key]) >= self.max_requests:
            return False

        self._requests[key].append(now)
        return True

    def reset(self, key: str) -> None:
        if key in self._requests:
            del self._requests[key]


# Global rate limiter for OTP verification endpoints: max 10 requests per minute per IP
otp_rate_limiter = InMemoryRateLimiter(max_requests=10, window_seconds=60)
