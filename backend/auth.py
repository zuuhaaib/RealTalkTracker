import logging
import os

import httpx
from fastapi import HTTPException


logger = logging.getLogger("uvicorn.error")

# Supabase answers quickly; don't hold a worker for long if it doesn't.
VERIFY_TIMEOUT_SECONDS = 5.0


def get_supabase_config():
    """Read the Supabase project URL and public key, or None if unset."""
    url = os.getenv("SUPABASE_URL", "").strip().rstrip("/")
    key = os.getenv("SUPABASE_PUBLISHABLE_KEY", "").strip()

    if not url or not key:
        return None

    return url, key


def read_bearer_token(authorization: str | None) -> str | None:
    if not authorization:
        return None

    scheme, _, token = authorization.partition(" ")

    if scheme.lower() != "bearer" or not token.strip():
        return None

    return token.strip()


async def verify_user(authorization: str | None) -> dict:
    """Return the signed-in Supabase user, or raise 401/503.

    The token is checked by Supabase itself (GET /auth/v1/user), which
    works for both legacy and asymmetric JWT signing keys and catches
    sessions that were signed out or revoked.
    """
    token = read_bearer_token(authorization)

    if token is None:
        raise HTTPException(
            status_code=401,
            detail="Please log in to analyze a chat.",
        )

    config = get_supabase_config()

    if config is None:
        raise HTTPException(
            status_code=503,
            detail="Sign-in isn't configured on the server yet.",
        )

    url, key = config

    try:
        async with httpx.AsyncClient(timeout=VERIFY_TIMEOUT_SECONDS) as client:
            response = await client.get(
                f"{url}/auth/v1/user",
                headers={
                    "apikey": key,
                    "Authorization": f"Bearer {token}",
                },
            )
    except httpx.HTTPError as exc:
        logger.error("Sign-in check failed: type=%s", type(exc).__name__)

        raise HTTPException(
            status_code=503,
            detail="Couldn't verify your sign-in right now. Try again shortly.",
        ) from None

    if response.status_code in (401, 403):
        raise HTTPException(
            status_code=401,
            detail="Your session has expired. Please log in again.",
        )

    if response.status_code != 200:
        logger.error("Sign-in check failed: status=%s", response.status_code)

        raise HTTPException(
            status_code=503,
            detail="Couldn't verify your sign-in right now. Try again shortly.",
        )

    try:
        user = response.json()
    except ValueError:
        user = None

    if not isinstance(user, dict) or not user.get("id"):
        raise HTTPException(
            status_code=401,
            detail="Your session has expired. Please log in again.",
        )

    return user
