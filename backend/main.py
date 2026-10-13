from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from parsers.whatsapp import parse_whatsapp_chat
from analysis.statistics import get_basic_statistics
from analysis.behavior import get_behavior_statistics
from analysis.awards import get_awards
from analysis.activity import get_activity_statistics
from analysis.text_stats import get_text_statistics
from analysis.sentiment import analyze_sentiment
from analysis.topics import analyze_topics
from analysis.ai_analysis import analyze_conversation_with_ai


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Chat Analyzer API is running"
    }


@app.post("/analyze")
async def analyze_chat(file: UploadFile = File(...)):
    if not file.filename.endswith(".txt"):
        raise HTTPException(
            status_code=400,
            detail="Please upload a .txt WhatsApp export."
        )

    contents = await file.read()

    try:
        text = contents.decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400,
            detail="Unable to read this text file."
        )

    messages = parse_whatsapp_chat(text)

    if not messages:
        raise HTTPException(
            status_code=400,
            detail="No WhatsApp messages could be detected."
        )

    stats = get_basic_statistics(messages)
    behavior = get_behavior_statistics(messages)
    awards = get_awards(stats, behavior)
    activity = get_activity_statistics(messages)
    text_stats = get_text_statistics(messages)
    sentiment = analyze_sentiment(messages)
    topics = analyze_topics(messages)
    ai_analysis = analyze_conversation_with_ai(
    messages,
    stats,
    behavior,
    text_stats,
    sentiment,
    topics
)

    return {
    "messageCount": len(messages),
    "messages": messages[:10],
    "statistics": stats,
    "behavior": behavior,
    "awards": awards,
    "activity": activity,
    "textStats": text_stats,
    "sentiment": sentiment,
    "topics": topics,
    "aiAnalysis": ai_analysis
}