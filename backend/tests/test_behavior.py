import unittest
from datetime import datetime, timedelta

from analysis.awards import get_awards
from analysis.behavior import get_behavior_statistics
from analysis.statistics import get_basic_statistics


START = datetime(2025, 1, 1, 12, 0)


def timeline(*entries):
    """Build messages from (sender, minutes after START) pairs."""
    return [
        {
            "sender": sender,
            "timestamp": (START + timedelta(minutes=minutes)).isoformat(),
            "message": "hi",
        }
        for sender, minutes in entries
    ]


class TwoPersonBehaviorTests(unittest.TestCase):
    def test_burst_of_six_counts_five_consecutive_messages(self):
        messages = timeline(*[("Alex", minute) for minute in range(6)])

        stats = get_behavior_statistics(messages)

        self.assertEqual(stats["Alex"]["doubleTexts"], 5)

    def test_no_short_time_threshold_for_consecutive_messages(self):
        # Five hours apart is still "consecutive"; six hours is a restart.
        messages = timeline(("Alex", 0), ("Alex", 300), ("Alex", 660))

        stats = get_behavior_statistics(messages)["Alex"]

        self.assertEqual(stats["doubleTexts"], 1)
        self.assertEqual(stats["conversationStarts"], 2)

    def test_reply_gap_is_the_median_when_sender_changes(self):
        messages = timeline(
            ("Alex", 0),
            ("Sam", 2),
            ("Alex", 3),
            ("Sam", 13),
            ("Alex", 14),
            ("Sam", 18),
        )

        stats = get_behavior_statistics(messages)

        # Sam's gaps: 2, 10 and 4 minutes -> median 4 minutes.
        self.assertEqual(stats["Sam"]["medianResponseTimeSeconds"], 240)
        self.assertEqual(stats["Alex"]["medianResponseTimeSeconds"], 60)

    def test_gaps_of_six_hours_are_starts_not_replies(self):
        messages = timeline(("Alex", 0), ("Sam", 360))

        stats = get_behavior_statistics(messages)

        self.assertEqual(stats["Sam"]["conversationStarts"], 1)
        self.assertIsNone(stats["Sam"]["medianResponseTimeSeconds"])


class GroupBehaviorTests(unittest.TestCase):
    messages = timeline(
        ("Alex", 0),
        ("Sam", 1),
        ("Jo", 2),
        ("Jo", 3),
        ("Alex", 10),
        ("Sam", 400),
    )

    def test_participation_counts_everyone(self):
        stats = get_basic_statistics(self.messages)

        self.assertEqual(
            {
                name: values["messages"]
                for name, values in stats["participants"].items()
            },
            {"Alex": 2, "Sam": 2, "Jo": 2},
        )

    def test_gap_belongs_to_whoever_spoke_next(self):
        # The metric doesn't claim Jo was answering Sam; it records the
        # gap before Jo's message, whoever spoke last.
        stats = get_behavior_statistics(self.messages)

        self.assertEqual(stats["Jo"]["medianResponseTimeSeconds"], 60)
        self.assertEqual(stats["Jo"]["doubleTexts"], 1)
        self.assertEqual(stats["Alex"]["medianResponseTimeSeconds"], 420)
        self.assertEqual(stats["Sam"]["conversationStarts"], 1)

    def test_awards_cover_every_participant_and_share_ties(self):
        stats = get_basic_statistics(self.messages)
        awards = get_awards(stats, get_behavior_statistics(self.messages))

        self.assertEqual(awards["biggestYapper"], "Alex & Jo & Sam (tie)")
        self.assertEqual(awards["doubleTexter"], "Jo")


if __name__ == "__main__":
    unittest.main()
