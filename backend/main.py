import os

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.concurrency import run_in_threadpool

from parsers.whatsapp import parse_whatsapp_chat
from parsers.instagram import parse_instagram_chat
from analysis.statistics import get_basic_statistics
from analysis.behavior import get_behavior_statistics
from analysis.awards import get_awards
from analysis.activity import get_activity_statistics
from analysis.text_stats import get_text_statistics
from analysis.ai_analysis import analyze_conversation_with_ai


app = FastAPI()
MAX_FILE_SIZE = 10 * 1024 * 1024

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        frontend_url,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Chat Analyzer API is running"}


@app.post("/analyze")
async def analyze_chat(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".txt"):
        raise HTTPException(
            status_code=400,
            detail="Please upload a .txt chat export.",
        )

    contents = await file.read(MAX_FILE_SIZE + 1)

    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="This file is too large. Please upload a file under 10 MiB.",
        )

    if not contents.strip():
        raise HTTPException(
            status_code=400,
            detail="This file is empty. Please upload a chat export.",
        )

    try:
        text = contents.decode("utf-8-sig")
    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400,
            detail="Unable to read this text file.",
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

    stats = get_basic_statistics(messages)
    behavior = get_behavior_statistics(messages)
    awards = get_awards(stats, behavior)
    activity = get_activity_statistics(messages)
    text_stats = get_text_statistics(messages)

    sentiment = {}
    topics = []

    try:
        ai_analysis = await run_in_threadpool(
            analyze_conversation_with_ai,
            messages,
            stats,
            behavior,
            text_stats,
            sentiment,
            topics,
        )
    except Exception:
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
        "textStats": text_stats,
        "sentiment": sentiment,
        "topics": topics,
        "aiAnalysis": ai_analysis,
    }