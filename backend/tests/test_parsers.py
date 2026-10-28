import unittest

from analysis.statistics import get_basic_statistics
from analysis.text_stats import extract_emojis, get_text_statistics
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


class WhatsAppDateConventionTests(unittest.TestCase):
    def timestamps(self, text):
        return [m["timestamp"] for m in parse_whatsapp_chat(text)]

    def test_all_ambiguous_dates_default_to_day_first(self):
        self.assertEqual(
            self.timestamps("02/03/2025, 10:00 - Alex: hi"),
            ["2025-03-02T10:00:00"],
        )

    def test_one_unambiguous_date_decides_the_whole_export(self):
        self.assertEqual(
            self.timestamps(
                "02/03/2025, 10:00 - Alex: hi\n"
                "03/13/2025, 10:00 - Sam: later"
            ),
            ["2025-02-03T10:00:00", "2025-03-13T10:00:00"],
        )

    def test_conflicting_conventions_are_rejected(self):
        self.assertEqual(
            parse_whatsapp_chat(
                "13/01/2025, 10:00 - Alex: hi\n"
                "01/13/2025, 10:00 - Sam: hey"
            ),
            [],
        )

    def test_explicit_order_must_be_valid(self):
        with self.assertRaises(ValueError):
            parse_whatsapp_chat("x", date_order="YMD")

    def test_two_digit_years_twelve_hour_times_and_seconds(self):
        self.assertEqual(
            self.timestamps(
                "[5/16/25, 12:05:09 AM] Alex: late\n"
                "[5/16/25, 12:30:00 PM] Sam: lunch"
            ),
            ["2025-05-16T00:05:09", "2025-05-16T12:30:00"],
        )

    def test_dotted_dates_and_invalid_times(self):
        self.assertEqual(
            self.timestamps(
                "16.05.25, 25:00 - Alex: impossible\n"
                "16.05.25, 23:59 - Sam: fine"
            ),
            ["2025-05-16T23:59:00"],
        )


class WhatsAppContentTests(unittest.TestCase):
    def test_group_creation_with_colon_is_skipped(self):
        messages = parse_whatsapp_chat(
            '[2024-01-05, 10:00:00] Alex created group "Trip: 2025"\n'
            "[2024-01-05, 10:01:00] Sam: hi"
        )

        self.assertEqual(pairs(messages), [("Sam", "hi")])

    def test_system_notices_and_call_records_are_excluded(self):
        messages = parse_whatsapp_chat(
            "[2024-01-05, 10:00:00] Alex: Messages and calls are "
            "end-to-end encrypted. Only people in this chat can read, "
            "listen to, or share them.\n"
            "[2024-01-05, 10:01:00] Alex: ‎Missed voice call\n"
            "[2024-01-05, 10:02:00] Sam: Voice call, 2 min\n"
            "[2024-01-05, 10:03:00] Sam added Jo\n"
            "[2024-01-05, 10:04:00] Sam: we should have a video call"
        )

        self.assertEqual(
            pairs(messages),
            [("Sam", "we should have a video call")],
        )

    def test_multiline_messages_are_joined(self):
        messages = parse_whatsapp_chat(
            "05/01/2024, 10:00 - Alex: line one\n"
            "line two\n"
            "\n"
            "line four\n"
            "05/01/2024, 10:01 - Sam: ok"
        )

        self.assertEqual(
            messages[0]["message"],
            "line one\nline two\n\nline four",
        )

    def test_unbalanced_bracket_is_not_a_header(self):
        messages = parse_whatsapp_chat(
            "[2024-01-05, 10:00:00] Alex: quoting\n"
            "[2024-01-05, 9:00 Sam: something\n"
            "[2024-01-05, 10:05:00] Sam: ok"
        )

        self.assertEqual(
            pairs(messages),
            [
                ("Alex", "quoting\n[2024-01-05, 9:00 Sam: something"),
                ("Sam", "ok"),
            ],
        )

    def test_ios_export_media_and_captions_end_to_end(self):
        messages = parse_whatsapp_chat(
            "[2024-01-05, 10:00:00] Alex: ‎image omitted\n"
            "[2024-01-05, 10:01:00] Alex: ‎<attached: 00000003-PHOTO"
            "-2024-01-05-10-01-00.jpg>\n"
            "look at this cat\n"
            "[2024-01-05, 10:02:00] Sam: why does it say image omitted?\n"
            "[2024-01-05, 10:03:00] Sam: This message was deleted\n"
            "[2024-01-05, 10:04:00] Sam: fine <This message was edited>"
        )

        stats = get_basic_statistics(messages)["participants"]
        text_stats = get_text_statistics(messages)

        # Media and deleted messages still count toward participation.
        self.assertEqual(stats["Alex"]["messages"], 2)
        self.assertEqual(stats["Sam"]["messages"], 3)

        # Placeholders and filenames add no words; captions do.
        self.assertEqual(stats["Alex"]["words"], 4)
        self.assertEqual(text_stats["Alex"]["mediaMessages"], 2)
        self.assertEqual(text_stats["Sam"]["mediaMessages"], 0)
        # "why does it say image omitted?" (6) + "fine" (1); the deleted
        # notice and edit marker add nothing.
        self.assertEqual(stats["Sam"]["words"], 7)


def pairs(messages):
    return [(m["sender"], m["message"]) for m in messages]


class InstagramParserTests(unittest.TestCase):
    # All fixtures are fictional. The supported contract is that the
    # copied text begins with a sender line; see README "Copied
    # Instagram format".

    def test_unsupported_leading_header_is_kept_not_guessed(self):
        # "Chat with Sam" is not a recognized Instagram structure, so the
        # parser cannot tell it from a one-off sender. It must keep the
        # text as supplied rather than silently reassigning the message.
        # This fixture was written for this test, not copied from a
        # real export.
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
            pairs(messages),
            [
                ("Sam", "first"),
                ("Alex", "yo"),
                ("Chat with Sam", "Sam\nhey"),
            ],
        )

    def test_one_off_participant_keeps_message_naming_someone(self):
        # Jo appears once, and their message has another participant's
        # name on its own line. Jo must stay the sender.
        messages = parse_instagram_chat(
            "Jo\n"
            "who's bringing snacks\n"
            "Sam\n"
            "Jan 5, 2024 3:02 pm\n"
            "Sam\n"
            "not me\n"
            "Jan 5, 2024 3:01 pm\n"
            "Alex\n"
            "yo\n"
            "Jan 5, 2024 3:00 pm"
        )

        self.assertEqual(
            pairs(messages),
            [
                ("Alex", "yo"),
                ("Sam", "not me"),
                ("Jo", "who's bringing snacks\nSam"),
            ],
        )

    def test_emoji_only_and_punctuation_led_messages_are_kept(self):
        messages = parse_instagram_chat(
            "Alex\n"
            "😂😂\n"
            "Jan 5, 2024 3:01 pm\n"
            "Sam\n"
            "...anyway\n"
            "Jan 5, 2024 3:00 pm"
        )

        self.assertEqual(
            pairs(messages),
            [("Sam", "...anyway"), ("Alex", "😂😂")],
        )

    def test_only_trailing_reaction_annotations_are_removed(self):
        messages = parse_instagram_chat(
            "Alex\n"
            "❤Sam\n"
            "real line\n"
            "❤Sam\n"
            "Jan 5, 2024 3:01 pm\n"
            "Sam\n"
            "hi\n"
            "Jan 5, 2024 3:00 pm"
        )

        # The annotation-shaped line in the middle stays; only the
        # trailing one is treated as a reaction.
        self.assertEqual(
            pairs(messages),
            [("Sam", "hi"), ("Alex", "❤Sam\nreal line")],
        )

    def test_activity_entries_are_ignored(self):
        messages = parse_instagram_chat(
            "Alex\n"
            "Liked a message\n"
            "Jan 5, 2024 3:01 pm\n"
            "Sam\n"
            "Reacted 😂 to your message\n"
            "Jan 5, 2024 3:00 pm\n"
            "Sam\n"
            "hi\n"
            "Jan 5, 2024 2:59 pm"
        )

        self.assertEqual(pairs(messages), [("Sam", "hi")])

    def test_newest_first_is_put_in_chronological_order(self):
        messages = parse_instagram_chat(
            "Alex\nsecond\nJan 5, 2024 3:01 pm\n"
            "Sam\nfirst\nJan 5, 2024 3:00 pm"
        )

        self.assertEqual(
            pairs(messages),
            [("Sam", "first"), ("Alex", "second")],
        )

    def test_identical_timestamps_keep_copied_order(self):
        # With every timestamp equal, the direction of the copy cannot
        # be inferred, so the copied order is kept as-is.
        messages = parse_instagram_chat(
            "Alex\nb\nJan 5, 2024 3:00 pm\n"
            "Sam\na\nJan 5, 2024 3:00 pm"
        )

        self.assertEqual(pairs(messages), [("Alex", "b"), ("Sam", "a")])


if __name__ == "__main__":
    unittest.main()
