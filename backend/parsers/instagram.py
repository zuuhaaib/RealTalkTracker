import re
from datetime import datetime


TIMESTAMP_PATTERN = re.compile(
    r"^[A-Z][a-z]{2} \d{1,2}, \d{4} "
    r"\d{1,2}:\d{2} (?:am|pm)$",
    re.IGNORECASE,
)

IGNORED_ACTIVITY_PATTERNS = [
    re.compile(r"^Liked a message$", re.IGNORECASE),
    re.compile(r"^Reacted .+ to your message$", re.IGNORECASE),
]


def is_timestamp(line):
    return bool(TIMESTAMP_PATTERN.fullmatch(line.strip()))


def is_ignored_activity(text):
    return any(
        pattern.fullmatch(text.strip())
        for pattern in IGNORED_ACTIVITY_PATTERNS
    )


def parse_timestamp(value):
    return datetime.strptime(
        value.strip(),
        "%b %d, %Y %I:%M %p",
    )


def is_emoji_sequence(text):
    """Recognize common emoji characters and their modifiers."""
    if not text:
        return False

    has_emoji = False

    for char in text:
        code = ord(char)

        if (
            0x1F000 <= code <= 0x1FAFF
            or 0x2600 <= code <= 0x27BF
        ):
            has_emoji = True
        elif code in (0x200D, 0xFE0E, 0xFE0F):
            continue
        else:
            return False

    return has_emoji


def is_reaction_annotation(line, participant_names):
    """
    Recognize a trailing annotation such as '❤anuva'.

    Emoji-only messages and punctuation-led messages do not match.
    """
    for name in participant_names:
        if not line.endswith(name):
            continue

        prefix = line[:-len(name)].strip()

        if is_emoji_sequence(prefix):
            return True

    return False


def parse_instagram_chat(text):
    text = (
        text.lstrip("\ufeff")
        .replace("\u202f", " ")
        .replace("\xa0", " ")
    )

    entries = []
    block = []

    # This format places the timestamp after the sender and content.
    # The input must begin with a sender, not a page title or navigation.
    for raw_line in text.splitlines():
        line = raw_line.strip()

        if not line:
            continue

        if is_timestamp(line):
            try:
                timestamp = parse_timestamp(line)
            except ValueError:
                block = []
                continue

            if block:
                entries.append({
                    "sender": block[0],
                    "timestamp": timestamp,
                    "content_lines": block[1:],
                })

            block = []
        else:
            block.append(line)

    # Preserve sender labels as supplied. Don't infer that a name is
    # a header merely because that participant appears only once.
    participant_names = {
        entry["sender"]
        for entry in entries
        if entry["sender"]
    }

    messages = []

    for entry in entries:
        content_lines = entry["content_lines"][:]

        # Only remove recognized reaction annotations at the end.
        while content_lines and is_reaction_annotation(
            content_lines[-1],
            participant_names,
        ):
            content_lines.pop()

        message = "\n".join(content_lines).strip()

        if not message or is_ignored_activity(message):
            continue

        messages.append({
            "sender": entry["sender"],
            "timestamp": entry["timestamp"].isoformat(),
            "message": message,
        })

    # For newest-first exports, reverse before the stable sort so
    # messages with equal timestamps follow the same ordering choice.
    if (
        len(entries) > 1
        and entries[0]["timestamp"] > entries[-1]["timestamp"]
    ):
        messages.reverse()

    messages.sort(key=lambda message: message["timestamp"])

    return messages