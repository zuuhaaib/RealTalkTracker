import re
from collections import Counter
from datetime import datetime

from analysis.message_content import split_message_content


STOP_WORDS = {
    "the", "a", "an", "and", "or", "but", "if", "then", "so",
    "to", "of", "in", "on", "for", "at", "with", "is", "it",
    "this", "that", "i", "you", "me", "my", "your", "we", "our",
    "he", "she", "they", "them", "be", "am", "are", "was", "were",
    "do", "does", "did", "have", "has", "had", "can", "could",
    "would", "should", "will", "just",
}

URL_PATTERN = re.compile(r"https?://\S+")
WORD_PATTERN = re.compile(r"\b[\w']+\b", re.UNICODE)


def extract_words(text: str):
    words = WORD_PATTERN.findall(text.lower())

    return [
        word
        for word in words
        if len(word) > 1
        and word not in STOP_WORDS
        and not word.isdigit()
    ]


ZERO_WIDTH_JOINER = 0x200D
VARIATION_SELECTORS = {0xFE0E, 0xFE0F}


def is_skin_tone(code: int):
    return 0x1F3FB <= code <= 0x1F3FF


def is_regional_indicator(code: int):
    return 0x1F1E6 <= code <= 0x1F1FF


def is_emoji_base(code: int):
    # Skin tones and flag letters only count as part of a sequence.
    if is_skin_tone(code) or is_regional_indicator(code):
        return False

    return (
        0x1F000 <= code <= 0x1FAFF
        or 0x2600 <= code <= 0x27BF
    )


def extract_emojis(text: str):
    """
    Group skin tones, ZWJ sequences, and flags into single emojis.

    This is a small range-based approximation, not full Unicode emoji
    segmentation. Known gaps: keycaps (#️⃣), subdivision flags,
    and emojis outside the checked ranges such as ⭐ or ⌚.
    """
    emojis = []
    index = 0

    while index < len(text):
        code = ord(text[index])

        # A flag is a pair of regional indicator letters.
        if is_regional_indicator(code):
            if (
                index + 1 < len(text)
                and is_regional_indicator(ord(text[index + 1]))
            ):
                emojis.append(text[index:index + 2])
                index += 2
            else:
                index += 1

            continue

        if not is_emoji_base(code):
            index += 1
            continue

        end = index + 1

        while end < len(text):
            next_code = ord(text[end])

            if is_skin_tone(next_code) or next_code in VARIATION_SELECTORS:
                end += 1
            elif (
                next_code == ZERO_WIDTH_JOINER
                and end + 1 < len(text)
                and is_emoji_base(ord(text[end + 1]))
            ):
                end += 2
            else:
                break

        emoji = text[index:end]

        # Count ❤ and ❤️ together. ZWJ sequences keep their selectors
        # because some only render correctly with them.
        if chr(ZERO_WIDTH_JOINER) not in emoji:
            emoji = emoji.replace("︎", "").replace("️", "")

        emojis.append(emoji)
        index = end

    return emojis


def get_text_statistics(messages):
    stats = {}

    for msg in messages:
        sender = msg["sender"]
        text, has_media = split_message_content(msg["message"])
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
                    "characters": 0,
                },
            }

        sender_stats = stats[sender]

        # Captions remain readable text even when media is present.
        sender_stats["wordCounter"].update(extract_words(text))
        sender_stats["emojiCounter"].update(extract_emojis(text))

        sender_stats["links"] += len(URL_PATTERN.findall(text))

        if "?" in text:
            sender_stats["questions"] += 1

        # Count messages containing media, not individual attachments.
        if has_media:
            sender_stats["mediaMessages"] += 1

        # Midnight through 4:59 AM, including media messages.
        if 0 <= timestamp.hour < 5:
            sender_stats["lateNightMessages"] += 1

        if len(text) > sender_stats["longestMessage"]["characters"]:
            sender_stats["longestMessage"] = {
                "text": text,
                "characters": len(text),
            }

    result = {}

    for sender, sender_stats in stats.items():
        result[sender] = {
            "topWords": [
                {"word": word, "count": count}
                for word, count in sender_stats["wordCounter"].most_common(10)
            ],
            "topEmojis": [
                {"emoji": emoji, "count": count}
                for emoji, count in sender_stats["emojiCounter"].most_common(10)
            ],
            "links": sender_stats["links"],
            "questions": sender_stats["questions"],
            "mediaMessages": sender_stats["mediaMessages"],
            "lateNightMessages": sender_stats["lateNightMessages"],
            "longestMessage": sender_stats["longestMessage"],
        }

    return result