import json
import os
from datetime import datetime
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo


class QuotaStoreUnavailable(RuntimeError):
    pass


# Redis executes the check and update atomically.
# Return 1 when an attempt is reserved, or 0 when exhausted.
RESERVE_SCRIPT = """
local current = tonumber(redis.call("GET", KEYS[1]) or "0")
local limit = tonumber(ARGV[1])

if current >= limit then
    return 0
end

redis.call("SET", KEYS[1], current + 1, "EX", 172800)
return 1
"""


def reserve_ai_attempt():
    """
    Reserve one AI attempt for the current Toronto calendar day.

    Return False when today's allowance is exhausted.
    Raise QuotaStoreUnavailable when the allowance cannot be verified.
    """
    url = os.getenv("UPSTASH_REDIS_REST_URL", "").strip().rstrip("/")
    token = os.getenv("UPSTASH_REDIS_REST_TOKEN", "").strip()

    if not url.startswith("https://") or not token:
        raise QuotaStoreUnavailable(
            "Quota store configuration is missing or invalid."
        )

    try:
        limit = int(os.getenv("AI_DAILY_LIMIT", "20"))

        if limit < 0:
            raise ValueError
    except ValueError:
        raise QuotaStoreUnavailable(
            "AI_DAILY_LIMIT must be a non-negative integer."
        ) from None

    if limit == 0:
        return False

    day = datetime.now(ZoneInfo("America/Toronto")).date().isoformat()
    key = f"talktracker:ai-attempts:{day}"

    command = [
        "EVAL",
        RESERVE_SCRIPT,
        "1",
        key,
        str(limit),
    ]

    request = Request(
        url,
        data=json.dumps(command).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        # Do not retry uncertain reservations: the counter may already
        # have been incremented even if the response was lost.
        with urlopen(request, timeout=5) as response:
            payload = json.load(response)
    except Exception:
        # Don't include credentials, URLs, or upstream response bodies.
        raise QuotaStoreUnavailable(
            "Unable to verify the daily AI allowance."
        ) from None

    if not isinstance(payload, dict) or "error" in payload:
        raise QuotaStoreUnavailable(
            "The quota store returned an unexpected response."
        )

    result = payload.get("result")

    if type(result) is not int or result not in (0, 1):
        raise QuotaStoreUnavailable(
            "The quota store returned an invalid reservation."
        )

    return result == 1