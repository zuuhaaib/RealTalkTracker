import logging
import os

from dotenv import load_dotenv

# Load backend/.env before anything reads the environment.
load_dotenv()

from fastapi import FastAPI, UploadFile, File, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.concurrency import run_in_threadpool

from auth import verify_user
from daily_quota import quota_identity
from request_limits import SHARED_BUCKET, analysis_limiter
from parsers.whatsapp import parse_whatsapp_chat
from parsers.instagram import parse_instagram_chat
from analysis.statistics import get_basic_statistics
from analysis.behavior import get_behavior_statistics
from analysis.awards import get_awards
from analysis.activity import get_activity_statistics
from analysis.text_stats import get_text_statistics
from analysis.ai_analysis import analyze_conversation_with_ai


logger = logging.getLogger("uvicorn.error")

app = FastAPI()

MAX_FILE_SIZE = 10 * 1024 * 1024

# Recognized chats per minute: for each account, and for everyone together.
ACCOUNT_MINUTE_LIMIT = 5
SHARED_MINUTE_LIMIT = 30

# Browsers send the origin without a trailing slash, and CORS
# compares origins exactly.
frontend_url = (
    os.getenv("FRONTEND_URL", "http://localhost:3000").strip().rstrip("/")
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        frontend_url,
    ],
    # Sign-in travels as a bearer token header, not as cookies.
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def process_chat(contents: bytes, account: str):
    """Run decoding, parsing, statistics, and AI analysis in a worker."""
    try:
        text = contents.decode("utf-8-sig")
    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400,
            detail="Unable to read this text file.",
        ) from None

    if not text.strip():
        raise HTTPException(
            status_code=400,
            detail="This file is empty. Please upload a chat export.",
        )

    messages = parse_whatsapp_chat(text)
    platform = "whatsapp"

    if not messages:
        messages = parse_instagram_chat(text)
        platform = "instagram"

    if not messages:
        raise HTTPException(
            status_code=400,
            detail="No WhatsApp or Instagram messages could be detected.",
        )

    # Only recognized chats consume the minute allowances.
    # The concurrency slot was reserved before reading and parsing.
    analysis_limiter.consume_attempts(
        [
            (account, ACCOUNT_MINUTE_LIMIT),
            (SHARED_BUCKET, SHARED_MINUTE_LIMIT),
        ]
    )

    stats = get_basic_statistics(messages)
    behavior = get_behavior_statistics(messages)
    awards = get_awards(stats, behavior)
    activity = get_activity_statistics(messages)
    # Only the AI uses these; they aren't part of the response.
    text_stats = get_text_statistics(messages)

    try:
        ai_analysis = analyze_conversation_with_ai(
            messages,
            stats,
            behavior,
            text_stats,
            account=account,
        )
    except Exception as exc:
        logger.error(
            "AI analysis failed: type=%s status=%s",
            type(exc).__name__,
            getattr(exc, "status_code", None),
        )

        ai_analysis = {
            "error": "AI analysis is temporarily unavailable."
        }

    return {
        "platform": platform,
        "messageCount": len(messages),
        "statistics": stats,
        "behavior": behavior,
        "awards": awards,
        "activity": activity,
        "aiAnalysis": ai_analysis,
    }


@app.get("/")
def root():
    return {"message": "Chat Analyzer API is running"}


@app.post("/analyze")
async def analyze_chat(
    file: UploadFile = File(...),
    authorization: str | None = Header(default=None),
):
    slot_acquired = False

    try:
        # Check the sign-in first, so rejected requests never take a
        # processing slot or use a rate allowance.
        user = await verify_user(authorization)

        if not file.filename or not file.filename.lower().endswith(".txt"):
            raise HTTPException(
                status_code=400,
                detail="Please upload a .txt chat export.",
            )

        # Bound concurrent file reads, parsing, and AI processing.
        # This does not consume a minute allowance.
        analysis_limiter.acquire_slot()
        slot_acquired = True

        contents = await file.read(MAX_FILE_SIZE + 1)

        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=(
                    "This file is too large. "
                    "Please upload a file under 10 MiB."
                ),
            )

        if not contents:
            raise HTTPException(
                status_code=400,
                detail="This file is empty. Please upload a chat export.",
            )

        # Limits follow the person's inbox, not just the account, so
        # email aliases and re-created accounts share one allowance.
        account = quota_identity(user)

        return await run_in_threadpool(process_chat, contents, account)

    finally:
        try:
            if slot_acquired:
                analysis_limiter.release()
        finally:
            await file.close()