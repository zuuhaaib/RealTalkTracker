import re
from collections import Counter
from datetime import datetime


STOP_WORDS = {
    "the", "a", "an", "and", "or", "but", "if", "then", "so",
    "to", "of", "in", "on", "for", "at", "with", "is", "it",
    "this", "that", "i", "you", "me", "my", "your", "we", "our",
    "he", "she", "they", "them", "be", "am", "are", "was", "were",
    "do", "does", "did", "have", "has", "had", "can", "could",
    "would", "should", "will", "just"
}


URL_PATTERN = re.compile(r"https?://\S+")
WORD_PATTERN = re.compile(r"\b[\w']+\b", re.UNICODE)

MEDIA_MARKERS = [
    "image omitted",
    "video omitted",
    "gif omitted",
    "sticker omitted",
    "document omitted",
    "voice call",
    "video call",
    "missed voice call",
]


def is_media_message(text: str):
    lower = text.lower()

    return any(marker in lower for marker in MEDIA_MARKERS)


def extract_words(text: str):
    words = WORD_PATTERN.findall(text.lower())

    return [
        word
        for word in words
        if len(word) > 1
        and word not in STOP_WORDS
        and not word.isdigit()
    ]


def extract_emojis(text: str):
    emojis = []

    for char in text:
        code = ord(char)

        if (
            0x1F300 <= code <= 0x1FAFF
            or 0x2600 <= code <= 0x26FF
            or 0x2700 <= code <= 0x27BF
        ):
            emojis.append(char)

    return emojis


def get_text_statistics(messages):
    stats = {}

    for msg in messages:
        sender = msg["sender"]
        text = msg["message"]
        timestamp = datetime.fromisoformat(msg["timestamp"])

        if sender not in stats:
            stats[sender] = {
                "wordCounter": Counter(),
                "emojiCounter": Counter(),
                "links": 0,
                "questions": 0,
                "mediaMessages": 0,
                "lateNightMessages": 0,
                "longestMessage": {
                    "text": "",
                    "characters": 0
                }
            }

        sender_stats = stats[sender]

        if not is_media_message(text):
            words = extract_words(text)
            sender_stats["wordCounter"].update(words)

        emojis = extract_emojis(text)
        sender_stats["emojiCounter"].update(emojis)

        sender_stats["links"] += len(
            URL_PATTERN.findall(text)
        )

        if "?" in text:
            sender_stats["questions"] += 1

        if is_media_message(text):
            sender_stats["mediaMessages"] += 1

        # 12 AM to 5 AM
        if 0 <= timestamp.hour < 5:
            sender_stats["lateNightMessages"] += 1

        if len(text) > sender_stats["longestMessage"]["characters"]:
            sender_stats["longestMessage"] = {
                "text": text,
                "characters": len(text)
            }

    result = {}

    for sender, sender_stats in stats.items():
        result[sender] = {
            "topWords": [
                {
                    "word": word,
                    "count": count
                }
                for word, count in sender_stats[
                    "wordCounter"
                ].most_common(10)
            ],

            "topEmojis": [
                {
                    "emoji": emoji,
                    "count": count
                }
                for emoji, count in sender_stats[
                    "emojiCounter"
                ].most_common(10)
            ],

            "links": sender_stats["links"],
            "questions": sender_stats["questions"],
            "mediaMessages": sender_stats["mediaMessages"],
            "lateNightMessages": sender_stats["lateNightMessages"],
            "longestMessage": sender_stats["longestMessage"]
        }

    return result