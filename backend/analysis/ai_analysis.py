import json
import os

from dotenv import load_dotenv
from openai import OpenAI


load_dotenv()

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)


def build_message_sample(messages, max_messages=200):
    if len(messages) <= max_messages:
        selected = messages
    else:
        step = max(1, len(messages) // max_messages)
        selected = messages[::step][:max_messages]

    return [
        {
            "sender": msg["sender"],
            "message": msg["message"][:500]
        }
        for msg in selected
    ]


def analyze_conversation_with_ai(
    messages,
    statistics,
    behavior,
    text_stats,
    sentiment,
    topics
):
    message_sample = build_message_sample(messages)

    analysis_data = {
        "statistics": statistics,
        "behavior": behavior,
        "textStats": text_stats,
        "sentiment": sentiment,
        "topics": topics,
        "messageSample": message_sample
    }

    prompt = f"""
You are analyzing a private text conversation between two or more people.

Your job is to produce a playful but evidence-based conversation analysis.

Do not invent facts.
Do not treat personality judgments as objective truths.
Base your conclusions on the supplied statistics and message examples.

Analyze:

1. Who appears funnier and why
2. Each person's humor style
3. Each person's texting style
4. Who seems more likely to initiate conversations
5. Who is more reactive vs proactive
6. Recurring topics
7. Possible recurring jokes or patterns
8. Overall conversation dynamic
9. Interesting observations
10. A short playful summary of each participant

Return ONLY valid JSON in this exact structure:

{{
  "funniest": {{
    "person": "",
    "confidence": 0,
    "reason": ""
  }},
  "participants": {{
    "PERSON_NAME": {{
      "humorStyle": "",
      "textingStyle": "",
      "summary": ""
    }}
  }},
  "conversationDynamic": "",
  "recurringTopics": [],
  "insideJokesOrPatterns": [],
  "interestingObservations": []
}}

Conversation data:

{json.dumps(analysis_data, ensure_ascii=False)}
"""

    response = client.responses.create(
        model="gpt-5.6",
        input=prompt
    )

    text = response.output_text.strip()

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {
            "error": "AI response was not valid JSON.",
            "raw": text
        }