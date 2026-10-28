import unittest

from analysis.text_stats import extract_emojis
from parsers.instagram import parse_instagram_chat
from parsers.whatsapp import parse_whatsapp_chat


class EmojiTests(unittest.TestCase):
    def test_skin_tone_stays_with_its_emoji(self):
        self.assertEqual(extract_emojis("nice 👍🏽"), ["👍🏽"])

    def test_zwj_sequence_is_one_emoji(self):
        self.assertEqual(extract_emojis("👨‍👩‍👧"), ["👨‍👩‍👧"])

    def test_flags_are_counted(self):
        self.assertEqual(extract_emojis("🇨🇦🇯🇵"), ["🇨🇦", "🇯🇵"])

    def test_variation_selector_is_merged(self):
        self.assertEqual(extract_emojis("❤️❤"), ["❤", "❤"])

    def test_lone_skin_tone_is_ignored(self):
        self.assertEqual(extract_emojis("🏽"), [])


class WhatsAppParserTests(unittest.TestCase):
    def test_subject_change_with_colon_is_not_a_participant(self):
        messages = parse_whatsapp_chat(
            "[2024-01-05, 10:00:00] Alex: hi\n"
            '[2024-01-05, 10:01:00] Alex changed the subject to "Trip: 2025"\n'
            "05/01/2024, 10:02 - Sam changed the subject from "
            '"Old: name" to "New: name"'
        )

        self.assertEqual(
            [message["sender"] for message in messages],
            ["Alex"],
        )

    def test_continuation_starting_with_date_is_kept(self):
        messages = parse_whatsapp_chat(
            "[2024-01-05, 10:00:00] Alex: meeting notes\n"
            "12/05/2024 10:00 standup\n"
            "more notes\n"
            "[2024-01-05, 10:05:00] Sam: ok"
        )

        self.assertEqual(len(messages), 2)
        self.assertEqual(
            messages[0]["message"],
            "meeting notes\n12/05/2024 10:00 standup\nmore notes",
        )

    def test_android_header_is_still_recognized(self):
        messages = parse_whatsapp_chat(
            "16/05/2025, 4:23 am - Alex: hello\n"
            "16/05/2025, 16:24 - Sam: hey"
        )

        self.assertEqual(
            [(m["sender"], m["timestamp"]) for m in messages],
            [
                ("Alex", "2025-05-16T04:23:00"),
                ("Sam", "2025-05-16T16:24:00"),
            ],
        )


class InstagramParserTests(unittest.TestCase):
    def test_leading_header_is_not_a_participant(self):
        messages = parse_instagram_chat(
            "Chat with Sam\n"
            "Sam\n"
            "hey\n"
            "Jan 5, 2024 3:01 pm\n"
            "Alex\n"
            "yo\n"
            "Jan 5, 2024 3:00 pm\n"
            "Sam\n"
            "first\n"
            "Jan 5, 2024 2:59 pm"
        )

        self.assertEqual(
            [(m["sender"], m["message"]) for m in messages],
            [("Sam", "first"), ("Alex", "yo"), ("Sam", "hey")],
        )


if __name__ == "__main__":
    unittest.main()
