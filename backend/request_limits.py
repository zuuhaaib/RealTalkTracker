from collections import deque
from math import ceil
from threading import Lock
from time import monotonic

from fastapi import HTTPException


class AnalysisLimiter:
    def __init__(
        self,
        requests_per_window=5,
        window_seconds=60,
        max_concurrent=2,
        max_tracked_buckets=10_000,
    ):
        self.requests_per_window = requests_per_window
        self.window_seconds = window_seconds
        self.max_concurrent = max_concurrent

        # Buckets are rate-limit keys. The app currently uses a single
        # shared bucket, because client IPs aren't trustworthy behind
        # the current proxy chain (see README "shared limits").
        self.max_tracked_buckets = max_tracked_buckets

        self._attempts = {}
        self._active = 0
        self._lock = Lock()

    def acquire_slot(self):
        """Reserve processing capacity without consuming a rate allowance."""
        with self._lock:
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

    def consume_attempt(self, bucket):
        """Consume an allowance only after a chat has been recognized."""
        now = monotonic()
        cutoff = now - self.window_seconds

        with self._lock:
            for key in list(self._attempts):
                attempts = self._attempts[key]

                while attempts and attempts[0] <= cutoff:
                    attempts.popleft()

                if not attempts:
                    del self._attempts[key]

            attempts = self._attempts.get(bucket)

            if attempts is None:
                if len(self._attempts) >= self.max_tracked_buckets:
                    raise HTTPException(
                        status_code=503,
                        detail="the server is busy. try again shortly",
                        headers={"Retry-After": "60"},
                    )

                attempts = deque()
                self._attempts[bucket] = attempts

            if len(attempts) >= self.requests_per_window:
                retry_after = max(
                    1,
                    ceil(
                        attempts[0]
                        + self.window_seconds
                        - now
                    ),
                )

                raise HTTPException(
                    status_code=429,
                    detail=(
                        "the shared analysis allowance is taking a breather. "
                        "try again in a minute"
                    ),
                    headers={"Retry-After": str(retry_after)},
                )

            attempts.append(now)

    def release(self):
        """Release a slot previously reserved by acquire_slot."""
        with self._lock:
            if self._active <= 0:
                raise RuntimeError("No active analysis slot to release.")

            self._active -= 1

    def acquire(self, bucket):
        """
        Compatibility helper for callers that need both limits together.

        The upload endpoint uses the separate methods so validation can
        happen before consuming the rate allowance.
        """
        self.acquire_slot()

        try:
            self.consume_attempt(bucket)
        except Exception:
            self.release()
            raise


analysis_limiter = AnalysisLimiter()