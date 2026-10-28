import re
from datetime import datetime


MESSAGE_PATTERN = re.compile(
    r"^\[?"
    r"(?P<date>\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4})"
    r",?\s+"
    r"(?P<time>\d{1,2}:\d{2}(?::\d{2})?)"
    r"\s*(?P<ampm>[AP]M)?"
    r"\]?"
    r"\s*(?:-\s*)?"
    r"(?P<content>.*)$",
    re.IGNORECASE,
)

SENDER_PATTERN = re.compile(
    r"^(?P<sender>[^:]+):(?:\s+|$)(?P<message>.*)$"
)

ENCRYPTION_NOTICE = (
    "Messages and calls are end-to-end encrypted. "
    "Only people in this chat can read, listen to, or share them."
)

# Match call records rather than messages merely mentioning calls.
CALL_RECORD_PATTERN = re.compile(
    r"^(?:"
    r"(?:voice|video) call"
    r"(?:,\s*(?:"
    r"\d+\s*(?:sec|min|hr|hour|second|minute)s?"
    r"(?:\s+\d+\s*(?:sec|min|hr|hour|second|minute)s?)*"
    r"|no answer|not answered|cancelled|canceled"
    r"))?"
    r"|missed (?:voice|video) call(?:,\s*tap to call back)?"
    r"|group call(?:,\s*\d+\s+invited)?"
    r")$",
    re.IGNORECASE,
)


def parse_timestamp(date_str: str, time_str: str, ampm: str | None):
    """Convert a supported WhatsApp date and time into a datetime."""
    normalized_date = date_str.replace(".", "/").replace("-", "/")
    parts = normalized_date.split("/")

    if len(parts[0]) == 4:
        date_formats = ["%Y/%m/%d"]
    elif int(parts[1]) > 12:
        date_formats = ["%m/%d/%Y", "%m/%d/%y"]
    else:
        # Ambiguous dates default to day/month/year.
        date_formats = ["%d/%m/%Y", "%d/%m/%y"]

    if ampm:
        time_formats = ["%I:%M:%S %p", "%I:%M %p"]
        time_value = f"{time_str} {ampm.upper()}"
    else:
        time_formats = ["%H:%M:%S", "%H:%M"]
        time_value = time_str

    for date_format in date_formats:
        for time_format in time_formats:
            try:
                return datetime.strptime(
                    f"{normalized_date} {time_value}",
                    f"{date_format} {time_format}",
                )
            except ValueError:
                continue

    return None


def is_excluded_entry(message: str):
    """Exclude empty entries and recognized English system/call records."""
    text = message.strip()

    if not text:
        return True

    if text.casefold() == ENCRYPTION_NOTICE.casefold():
        return True

    return bool(CALL_RECORD_PATTERN.fullmatch(text))


def parse_whatsapp_chat(text: str):
    messages = []
    current_message = None

    text = (
        text.lstrip("\ufeff")
        .replace("\u200e", "")
        .replace("\u200f", "")
        .replace("\u202f", " ")
        .replace("\xa0", " ")
    )

    def save_current_message():
        if current_message is None:
            return

        message = current_message["message"].strip()

        if not is_excluded_entry(message):
            messages.append({
                **current_message,
                "message": message,
            })

    for line in text.splitlines():
        match = MESSAGE_PATTERN.match(line)

        if match:
            # Finish the entire previous entry before filtering it.
            # This preserves messages whose text starts on the next line.
            save_current_message()
            current_message = None

            timestamp = parse_timestamp(
                match.group("date"),
                match.group("time"),
                match.group("ampm"),
            )

            if timestamp is None:
                continue

            sender_match = SENDER_PATTERN.match(match.group("content"))

            # Timestamped system entries without a sender are skipped.
            if sender_match is None:
                continue

            sender = sender_match.group("sender").strip()

            if not sender:
                continue

            current_message = {
                "sender": sender,
                "timestamp": timestamp.isoformat(),
                "message": sender_match.group("message"),
            }

        elif current_message is not None:
            current_message["message"] += "\n" + line

    # The final entry has no subsequent timestamp to trigger saving.
    save_current_message()

    # Preserve original ordering when timestamps are identical.
    messages.sort(key=lambda message: message["timestamp"])

    return messages