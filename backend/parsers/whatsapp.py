import re
from datetime import datetime


MESSAGE_PATTERN = re.compile(
    r"^\[?"
    r"(\d{4}-\d{1,2}-\d{1,2}),\s*"
    r"(\d{1,2}:\d{2}(?::\d{2})?)\s*"
    r"([APap][Mm])"
    r"\]?\s*"
    r"([^:]+):\s*"
    r"(.*)$"
)


def parse_whatsapp_chat(text: str):
    messages = []
    current_message = None

    # Clean invisible WhatsApp unicode characters
    text = (
        text.replace("\u200e", "")
        .replace("\u202f", " ")
        .replace("\xa0", " ")
    )

    for line in text.splitlines():
        match = MESSAGE_PATTERN.match(line)

        if match:
            date_str = match.group(1)
            time_str = match.group(2)
            am_pm = match.group(3)
            sender = match.group(4).strip()
            message = match.group(5).strip()

            timestamp = None

            formats = [
                "%Y-%m-%d %I:%M:%S %p",
                "%Y-%m-%d %I:%M %p",
            ]

            for fmt in formats:
                try:
                    timestamp = datetime.strptime(
                        f"{date_str} {time_str} {am_pm}",
                        fmt
                    )
                    break
                except ValueError:
                    continue

            if timestamp is None:
                continue

            current_message = {
                "sender": sender,
                "timestamp": timestamp.isoformat(),
                "message": message
            }

            messages.append(current_message)

        else:
            # Multiline messages belong to the previous message
            if current_message and line.strip():
                current_message["message"] += "\n" + line.strip()

    return messages