from collections import deque
from threading import Lock
from time import monotonic

from fastapi import HTTPException


class AnalysisLimiter:
    def __init__(
        self,
        requests_per_window=5,
        window_seconds=60,
        max_concurrent=2,
        max_tracked_ips=10_000,
    ):
        self.requests_per_window = requests_per_window
        self.window_seconds = window_seconds
        self.max_concurrent = max_concurrent
        self.max_tracked_ips = max_tracked_ips

        self._attempts = {}
        self._active = 0
        self._lock = Lock()

    def acquire(self, client_ip):
        now = monotonic()
        cutoff = now - self.window_seconds

        with self._lock:
            # Expire old records so the tracking dictionary stays bounded.
            for ip in list(self._attempts):
                attempts = self._attempts[ip]

                while attempts and attempts[0] <= cutoff:
                    attempts.popleft()

                if not attempts:
                    del self._attempts[ip]

            attempts = self._attempts.get(client_ip)

            if attempts is None:
                if len(self._attempts) >= self.max_tracked_ips:
                    raise HTTPException(
                        status_code=503,
                        detail="the server is busy. try again shortly",
                        headers={"Retry-After": "60"},
                    )

                attempts = deque()
                self._attempts[client_ip] = attempts

            if len(attempts) >= self.requests_per_window:
                retry_after = max(
                    1,
                    int(
                        attempts[0]
                        + self.window_seconds
                        - now
                    ) + 1,
                )

                raise HTTPException(
                    status_code=429,
                    detail=(
                        "easy on the overthinking. "
                        "try again in a minute"
                    ),
                    headers={"Retry-After": str(retry_after)},
                )

            # Count attempts even when all analysis slots are occupied.
            attempts.append(now)

            if self._active >= self.max_concurrent:
                raise HTTPException(
                    status_code=503,
                    detail=(
                        "currently overthinking other chats. "
                        "try again shortly"
                    ),
                    headers={"Retry-After": "5"},
                )

            self._active += 1

    def release(self):
        with self._lock:
            self._active -= 1


analysis_limiter = AnalysisLimiter()