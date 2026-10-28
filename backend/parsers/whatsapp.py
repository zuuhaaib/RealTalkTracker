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

# Check the complete entry before splitting at a colon.
# This prevents a notice such as:
# Alex created group "Trip: 2025"
# from creating a participant named 'Alex created group "Trip'.
GROUP_CREATION_PATTERN = re.compile(
    r'^[^:\n]+ created (?:the )?group\s+["“].*["”]$',
    re.IGNORECASE,
)

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


def parse_timestamp(
    date_str: str,
    time_str: str,
    ampm: str | None,
    date_order: str = "DMY",
):
    """Parse a timestamp without switching date conventions per message."""
    normalized_date = date_str.replace(".", "/").replace("-", "/")
    parts = normalized_date.split("/")

    if len(parts[0]) == 4:
        date_formats = ["%Y/%m/%d"]
    elif date_order == "MDY":
        date_formats = ["%m/%d/%Y", "%m/%d/%y"]
    else:
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


def detect_date_order(lines):
    """
    Choose one date convention for the entire export.

    An unambiguous date anywhere in the file determines the convention
    for ambiguous dates elsewhere in that file.

    If all dates are ambiguous, default to day/month/year.
    Return None if valid dates require conflicting conventions.
    """
    possible_orders = {"DMY", "MDY"}

    for line in lines:
        match = MESSAGE_PATTERN.match(line)

        if match is None:
            continue

        date_str = match.group("date")
        parts = re.split(r"[-/.]", date_str)

        # Year-first dates are already unambiguous.
        if len(parts[0]) == 4:
            continue

        valid_orders = {
            order
            for order in ("DMY", "MDY")
            if parse_timestamp(
                date_str,
                match.group("time"),
                match.group("ampm"),
                order,
            ) is not None
        }

        # Invalid timestamps should not decide the date convention.
        if valid_orders:
            possible_orders &= valid_orders

    if not possible_orders:
        return None

    return "DMY" if "DMY" in possible_orders else "MDY"


def is_excluded_entry(message: str):
    """Exclude empty entries and recognized English system/call records."""
    text = message.strip()

    return (
        not text
        or text.casefold() == ENCRYPTION_NOTICE.casefold()
        or bool(CALL_RECORD_PATTERN.fullmatch(text))
    )


def parse_whatsapp_chat(text: str, date_order: str | None = None):
    text = (
        text.lstrip("\ufeff")
        .replace("\u200e", "")
        .replace("\u200f", "")
        .replace("\u202f", " ")
        .replace("\xa0", " ")
    )

    lines = text.splitlines()

    if date_order is None:
        date_order = detect_date_order(lines)

        if date_order is None:
            # The existing endpoint handles an empty result as an
            # unsupported export rather than returning mixed dates.
            return []
    else:
        date_order = date_order.upper()

        if date_order not in {"DMY", "MDY"}:
            raise ValueError("date_order must be DMY or MDY")

    messages = []
    current_message = None

    def save_current_message():
        if current_message is None:
            return

        message = current_message["message"].strip()

        if not is_excluded_entry(message):
            messages.append({
                **current_message,
                "message": message,
            })

    for line in lines:
        match = MESSAGE_PATTERN.match(line)

        if match:
            save_current_message()
            current_message = None

            timestamp = parse_timestamp(
                match.group("date"),
                match.group("time"),
                match.group("ampm"),
                date_order,
            )

            if timestamp is None:
                continue

            content = match.group("content")

            if GROUP_CREATION_PATTERN.fullmatch(content):
                continue

            sender_match = SENDER_PATTERN.match(content)

            if sender_match is None:
                continue

            sender = sender_match.group("sender").strip()

            if sender:
                current_message = {
                    "sender": sender,
                    "timestamp": timestamp.isoformat(),
                    "message": sender_match.group("message"),
                }

        elif current_message is not None:
            current_message["message"] += "\n" + line

    save_current_message()

    # Stable sorting preserves export order for identical timestamps.
    messages.sort(key=lambda message: message["timestamp"])

    return messages