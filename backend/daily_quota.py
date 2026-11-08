import hashlib
import json
import os
from datetime import datetime
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo


class QuotaStoreUnavailable(RuntimeError):
    pass


# Redis executes the checks and updates atomically. Each Toronto day
# has one hash: field "site" counts every AI attempt, and one field per
# account counts that account's attempts. Return 1 when an attempt is
# reserved, 0 when the site-wide allowance is exhausted, or 2 when this
# account's allowance is exhausted. Nothing is counted unless both
# allowances have room.
RESERVE_SCRIPT = """
local site = tonumber(redis.call("HGET", KEYS[1], "site") or "0")
local account = tonumber(redis.call("HGET", KEYS[1], ARGV[1]) or "0")

if account >= tonumber(ARGV[3]) then
    return 2
end

if site >= tonumber(ARGV[2]) then
    return 0
end

redis.call("HINCRBY", KEYS[1], "site", 1)
redis.call("HINCRBY", KEYS[1], ARGV[1], 1)
redis.call("EXPIRE", KEYS[1], 172800)
return 1
"""

RESERVED = "reserved"
SITE_EXHAUSTED = "site"
ACCOUNT_EXHAUSTED = "account"

RESULTS = {1: RESERVED, 0: SITE_EXHAUSTED, 2: ACCOUNT_EXHAUSTED}


def read_limit(name, default):
    try:
        limit = int(os.getenv(name, str(default)))

        if limit < 0:
            raise ValueError
    except ValueError:
        raise QuotaStoreUnavailable(
            f"{name} must be a non-negative integer."
        ) from None

    return limit


GMAIL_DOMAINS = {"gmail.com", "googlemail.com"}


def normalize_email(email):
    """
    Reduce an address to the inbox it delivers to, or None.

    "+tags" are dropped for every provider, and Gmail also ignores dots,
    so Name.Here+1@googlemail.com and namehere@gmail.com are one inbox.
    """
    if not isinstance(email, str):
        return None

    local, at, domain = email.strip().lower().rpartition("@")

    if not at or not local or not domain:
        return None

    local = local.split("+", 1)[0]

    if domain in GMAIL_DOMAINS:
        local = local.replace(".", "")
        domain = "gmail.com"

    if not local:
        return None

    return f"{local}@{domain}"


def quota_identity(user):
    """
    Who an allowance belongs to: the person's inbox when there is one,
    so aliases and re-created accounts share it, else the account id.
    """
    email = normalize_email(user.get("email"))

    if email:
        return f"email:{email}"

    return f"user:{user['id']}"


def account_field(account):
    # Hash the identity so the quota store holds no email or account id.
    digest = hashlib.sha256(str(account).encode("utf-8")).hexdigest()[:32]
    return f"account:{digest}"


def account_daily_limit():
    """Return AI_USER_DAILY_LIMIT, or None if it is invalid."""
    try:
        return read_limit("AI_USER_DAILY_LIMIT", 3)
    except QuotaStoreUnavailable:
        return None


def reserve_ai_attempt(account):
    """
    Reserve one AI attempt for this person on the current Toronto day.

    account is the value from quota_identity().

    Return RESERVED, SITE_EXHAUSTED or ACCOUNT_EXHAUSTED.
    Raise QuotaStoreUnavailable when the allowance cannot be verified.
    """
    if not account:
        raise QuotaStoreUnavailable("An account is required for AI analysis.")

    url = os.getenv("UPSTASH_REDIS_REST_URL", "").strip().rstrip("/")
    token = os.getenv("UPSTASH_REDIS_REST_TOKEN", "").strip()

    if not url.startswith("https://") or not token:
        raise QuotaStoreUnavailable(
            "Quota store configuration is missing or invalid."
        )

    site_limit = read_limit("AI_DAILY_LIMIT", 100)
    user_limit = read_limit("AI_USER_DAILY_LIMIT", 3)

    if site_limit == 0:
        return SITE_EXHAUSTED

    if user_limit == 0:
        return ACCOUNT_EXHAUSTED

    day = datetime.now(ZoneInfo("America/Toronto")).date().isoformat()
    command = [
        "EVAL",
        RESERVE_SCRIPT,
        "1",
        f"talktracker:ai-quota:{day}",
        account_field(account),
        str(site_limit),
        str(user_limit),
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

    if type(result) is not int or result not in RESULTS:
        raise QuotaStoreUnavailable(
            "The quota store returned an invalid reservation."
        )

    return RESULTS[result]