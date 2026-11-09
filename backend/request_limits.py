from collections import deque
from math import ceil
from threading import Lock
from time import monotonic

from fastapi import HTTPException


SHARED_BUCKET = "shared-analysis-limit"


class AnalysisLimiter:
    def __init__(
        self,
        window_seconds=60,
        max_concurrent=2,
        max_tracked_buckets=10_000,
    ):
        self.window_seconds = window_seconds
        self.max_concurrent = max_concurrent

        # Buckets are rate-limit keys: one per signed-in account plus a
        # shared one for everyone. Client IPs aren't used because they
        # can be faked behind the current proxy chain (see README).
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

    def consume_attempts(self, limits):
        """
        Consume one attempt from each (bucket, limit) pair, or from none.

        Every bucket is checked before any is charged, so a request that
        is turned away by one limit doesn't use up the others.
        """
        now = monotonic()
        cutoff = now - self.window_seconds

        with self._lock:
            for key in list(self._attempts):
                attempts = self._attempts[key]

                while attempts and attempts[0] <= cutoff:
                    attempts.popleft()

                if not attempts:
                    del self._attempts[key]

            new_buckets = sum(
                1 for bucket, _ in limits if bucket not in self._attempts
            )

            if len(self._attempts) + new_buckets > self.max_tracked_buckets:
                raise HTTPException(
                    status_code=503,
                    detail="the server is busy. try again shortly",
                    headers={"Retry-After": "60"},
                )

            for bucket, limit in limits:
                attempts = self._attempts.get(bucket, ())

                if len(attempts) >= limit:
                    retry_after = max(
                        1,
                        ceil(attempts[0] + self.window_seconds - now),
                    )

                    raise HTTPException(
                        status_code=429,
                        detail=(
                            "the shared analysis allowance is taking a breather. "
                            "try again in a minute"
                            if bucket == SHARED_BUCKET
                            else "easy there. you can analyze another chat in a minute"
                        ),
                        headers={"Retry-After": str(retry_after)},
                    )

            for bucket, _ in limits:
                self._attempts.setdefault(bucket, deque()).append(now)

    def release(self):
        """Release a slot previously reserved by acquire_slot."""
        with self._lock:
            if self._active <= 0:
                raise RuntimeError("No active analysis slot to release.")

            self._active -= 1


analysis_limiter = AnalysisLimiter()