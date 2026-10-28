import re


OMITTED_LABEL = r"(?:image|video|audio|gif|sticker|document|media) omitted"

MEDIA_LINE_PATTERN = re.compile(
    rf"^(?:{OMITTED_LABEL}|<{OMITTED_LABEL}>|<attached:\s*[^>\r\n]+>)$",
    re.IGNORECASE,
)


def split_message_content(text: str):
    """Return readable text and whether recognized media lines were found."""
    readable_lines = []
    has_media = False

    for line in text.splitlines():
        cleaned = line.replace("\u200e", "").replace("\u200f", "")

        if MEDIA_LINE_PATTERN.fullmatch(cleaned.strip()):
            has_media = True
        else:
            readable_lines.append(cleaned)

    return "\n".join(readable_lines).strip(), has_media