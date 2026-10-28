import re


OMITTED_LABEL = (
    r"(?:image|video|audio|gif|sticker|document|media|contact card) omitted"
)

MEDIA_LINE_PATTERN = re.compile(
    rf"^(?:{OMITTED_LABEL}|<{OMITTED_LABEL}>"
    r"|<attached:\s*[^>\r\n]+>"
    # Android exports that include media, e.g.
    # "IMG-20240101-WA0001.jpg (file attached)".
    r"|\S.*\.\w{1,5} \(file attached\))$",
    re.IGNORECASE,
)

# Deleted messages still count as messages, but have no readable text.
DELETED_LINE_PATTERN = re.compile(
    r"^(?:this message was deleted|you deleted this message)\.?$",
    re.IGNORECASE,
)

EDITED_MARKER_PATTERN = re.compile(
    r"\s*<this message was edited>$",
    re.IGNORECASE,
)


def split_message_content(text: str):
    """Return readable text and whether recognized media lines were found."""
    readable_lines = []
    has_media = False

    for line in text.splitlines():
        cleaned = line.replace("‎", "").replace("‏", "")
        cleaned = EDITED_MARKER_PATTERN.sub("", cleaned)
        stripped = cleaned.strip()

        if MEDIA_LINE_PATTERN.fullmatch(stripped):
            has_media = True
        elif not DELETED_LINE_PATTERN.fullmatch(stripped):
            readable_lines.append(cleaned)

    return "\n".join(readable_lines).strip(), has_media
