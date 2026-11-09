"""
The emoji code points the parsers and statistics recognize.

A small range-based approximation, not full Unicode emoji segmentation.
Shared so the Instagram parser and the emoji counts can't drift apart.
"""

ZERO_WIDTH_JOINER = 0x200D
VARIATION_SELECTORS = {0xFE0E, 0xFE0F}


def is_emoji_code(code: int):
    """Pictographs, symbols, skin tones and flag letters in the checked ranges."""
    return 0x1F000 <= code <= 0x1FAFF or 0x2600 <= code <= 0x27BF


def is_skin_tone(code: int):
    return 0x1F3FB <= code <= 0x1F3FF


def is_regional_indicator(code: int):
    return 0x1F1E6 <= code <= 0x1F1FF
