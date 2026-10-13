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


REACTION_LINE_PATTERN = re.compile(
    r"^[^\w\s]+.+$"
)


def is_timestamp(line):
    return bool(TIMESTAMP_PATTERN.match(line.strip()))


def is_ignored_activity(text):
    text = text.strip()

    return any(
        pattern.match(text)
        for pattern in IGNORED_ACTIVITY_PATTERNS
    )


def parse_timestamp(value):
    return datetime.strptime(
        value.strip(),
        "%b %d, %Y %I:%M %p"
    )


def parse_instagram_chat(text):
    lines = [
        line.strip()
        for line in text.splitlines()
    ]

    messages = []
    block = []

    for line in lines:
        if not line:
            continue

        if is_timestamp(line):
            if block:
                timestamp = parse_timestamp(line)
                sender = block[0].strip()

                content_lines = block[1:]

                if sender and content_lines:
                    cleaned_lines = []

                    for content_line in content_lines:
                        if REACTION_LINE_PATTERN.match(content_line):
                            continue

                        cleaned_lines.append(content_line)

                    message = "\n".join(cleaned_lines).strip()

                    if (
                        message
                        and not is_ignored_activity(message)
                    ):
                        messages.append({
                            "sender": sender,
                            "timestamp": timestamp.isoformat(),
                            "message": message,
                        })

            block = []

        else:
            block.append(line)

    messages.reverse()

    return messages