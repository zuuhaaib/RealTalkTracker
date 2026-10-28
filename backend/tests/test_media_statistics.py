import unittest

from analysis.ai_analysis import build_message_sample
from analysis.message_content import split_message_content
from analysis.statistics import get_basic_statistics
from analysis.text_stats import get_text_statistics


def message(text):
    return {
        "sender": "Alex",
        "timestamp": "2025-05-16T04:23:03",
        "message": text,
    }


class MediaStatisticsTests(unittest.TestCase):
    def test_placeholders_are_removed(self):
        placeholders = [
            "image omitted",
            "<Media omitted>",
            "\u200eaudio omitted",
            "<attached: 00000001-PHOTO-2025-05-16.jpg>",
        ]

        for text in placeholders:
            with self.subTest(text=text):
                self.assertEqual(
                    split_message_content(text),
                    ("", True),
                )

    def test_sentences_about_calls_are_text(self):
        text = "we should have a video call"

        self.assertEqual(
            split_message_content(text),
            (text, False),
        )

        stats = get_text_statistics([message(text)])["Alex"]

        self.assertEqual(stats["mediaMessages"], 0)
        self.assertIn(
            "video",
            [item["word"] for item in stats["topWords"]],
        )

    def test_caption_is_preserved(self):
        self.assertEqual(
            split_message_content(
                "<attached: photo.jpg>\nlook at this cat"
            ),
            ("look at this cat", True),
        )

    def test_media_has_no_placeholder_words_or_characters(self):
        stats = get_basic_statistics([
            message("<Media omitted>")
        ])["participants"]["Alex"]

        self.assertEqual(stats["messages"], 1)
        self.assertEqual(stats["words"], 0)
        self.assertEqual(stats["characters"], 0)

    def test_text_statistics_use_caption(self):
        stats = get_text_statistics([
            message("<attached: photo.jpg>\nhello cat 😂")
        ])["Alex"]

        self.assertEqual(stats["mediaMessages"], 1)
        self.assertEqual(
            stats["longestMessage"]["text"],
            "hello cat 😂",
        )
        self.assertEqual(
            stats["topEmojis"],
            [{"emoji": "😂", "count": 1}],
        )
        self.assertEqual(
            {item["word"] for item in stats["topWords"]},
            {"hello", "cat"},
        )

    def test_average_still_uses_all_messages(self):
        stats = get_basic_statistics([
            message("hello there"),
            message("image omitted"),
        ])["participants"]["Alex"]

        self.assertEqual(stats["messages"], 2)
        self.assertEqual(stats["words"], 2)
        self.assertEqual(stats["averageWordsPerMessage"], 1)

    def test_mentioning_placeholder_is_not_media(self):
        text = "why does it say image omitted?"

        self.assertEqual(
            split_message_content(text),
            (text, False),
        )

    def test_multiple_attachments_count_as_one_media_message(self):
        stats = get_text_statistics([
            message("<attached: a.jpg>\n<attached: b.jpg>")
        ])["Alex"]

        self.assertEqual(stats["mediaMessages"], 1)
        self.assertEqual(stats["topWords"], [])
        self.assertEqual(
            stats["longestMessage"]["characters"],
            0,
        )

    def test_more_placeholders_are_media(self):
        for text in (
            "IMG-20240101-WA0001.jpg (file attached)",
            "‎Contact card omitted",
        ):
            with self.subTest(text=text):
                self.assertEqual(split_message_content(text), ("", True))

    def test_deleted_messages_have_no_text_and_no_media(self):
        for text in (
            "This message was deleted",
            "‎You deleted this message.",
        ):
            with self.subTest(text=text):
                self.assertEqual(split_message_content(text), ("", False))

    def test_edited_marker_is_removed(self):
        stats = get_text_statistics([
            message("see you soon <This message was edited>")
        ])["Alex"]

        self.assertEqual(
            {item["word"] for item in stats["topWords"]},
            {"see", "soon"},
        )
        self.assertEqual(
            stats["longestMessage"]["text"],
            "see you soon",
        )

    def test_ai_sample_excludes_media_but_keeps_captions(self):
        sample = build_message_sample([
            message("<Media omitted>"),
            message("<attached: photo.jpg>"),
            message("<attached: other.jpg>\nlook at this cat"),
            message("we should have a video call"),
        ])

        self.assertEqual(len(sample), 1)
        self.assertEqual(
            sample[0]["messages"],
            [
                {
                    "sender": "Alex",
                    "message": "look at this cat",
                },
                {
                    "sender": "Alex",
                    "message": "we should have a video call",
                },
            ],
        )


if __name__ == "__main__":
    unittest.main()