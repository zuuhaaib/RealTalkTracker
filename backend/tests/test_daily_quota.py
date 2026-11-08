import json
import unittest
from datetime import datetime
from unittest.mock import MagicMock, patch
from zoneinfo import ZoneInfo

from daily_quota import (
    ACCOUNT_EXHAUSTED,
    RESERVED,
    SITE_EXHAUSTED,
    QuotaStoreUnavailable,
    account_field,
    normalize_email,
    quota_identity,
    reserve_ai_attempt,
)


USER = "email:someone@example.com"


class DailyQuotaTests(unittest.TestCase):
    def setUp(self):
        self.environment = patch.dict(
            "os.environ",
            {
                "UPSTASH_REDIS_REST_URL": "https://example.upstash.io",
                "UPSTASH_REDIS_REST_TOKEN": "test-token",
                "AI_DAILY_LIMIT": "20",
                "AI_USER_DAILY_LIMIT": "3",
            },
            clear=True,
        )
        self.environment.start()
        self.addCleanup(self.environment.stop)

    def mock_response(self, result):
        response = MagicMock()
        response.read.return_value = json.dumps(result).encode("utf-8")

        context = MagicMock()
        context.__enter__.return_value = response

        return context

    def test_store_results_map_to_reservations(self):
        for result, expected in (
            (1, RESERVED),
            (0, SITE_EXHAUSTED),
            (2, ACCOUNT_EXHAUSTED),
        ):
            with self.subTest(result=result):
                with patch(
                    "daily_quota.urlopen",
                    return_value=self.mock_response({"result": result}),
                ):
                    self.assertEqual(reserve_ai_attempt(USER), expected)

    def test_missing_account_blocks_ai(self):
        with patch("daily_quota.urlopen") as send:
            for user_id in (None, ""):
                with self.assertRaises(QuotaStoreUnavailable):
                    reserve_ai_attempt(user_id)

            send.assert_not_called()

    def test_network_failure_blocks_ai(self):
        with patch(
            "daily_quota.urlopen",
            side_effect=TimeoutError,
        ) as send:
            with self.assertRaises(QuotaStoreUnavailable):
                reserve_ai_attempt(USER)

            # An uncertain reservation must not be retried.
            self.assertEqual(send.call_count, 1)

    def test_missing_credentials_blocks_ai(self):
        with patch.dict(
            "os.environ",
            {"UPSTASH_REDIS_REST_TOKEN": ""},
        ):
            with self.assertRaises(QuotaStoreUnavailable):
                reserve_ai_attempt(USER)

    def test_zero_limits_do_not_contact_database(self):
        for name, expected in (
            ("AI_DAILY_LIMIT", SITE_EXHAUSTED),
            ("AI_USER_DAILY_LIMIT", ACCOUNT_EXHAUSTED),
        ):
            with self.subTest(name=name):
                with patch.dict("os.environ", {name: "0"}):
                    with patch("daily_quota.urlopen") as send:
                        self.assertEqual(reserve_ai_attempt(USER), expected)
                        send.assert_not_called()

    def test_invalid_account_limit_blocks_ai(self):
        with patch.dict("os.environ", {"AI_USER_DAILY_LIMIT": "-1"}):
            with patch("daily_quota.urlopen") as send:
                with self.assertRaises(QuotaStoreUnavailable):
                    reserve_ai_attempt(USER)

                send.assert_not_called()

    def test_email_aliases_share_one_inbox(self):
        same = [
            "Name.Here@gmail.com",
            "namehere+1@gmail.com",
            "n.a.m.e.h.e.r.e+tt@googlemail.com",
            "  NAMEHERE@GMAIL.COM ",
        ]

        for email in same:
            with self.subTest(email=email):
                self.assertEqual(normalize_email(email), "namehere@gmail.com")

        # Other providers keep dots, but still drop +tags.
        self.assertEqual(
            normalize_email("first.last+x@outlook.com"),
            "first.last@outlook.com",
        )
        self.assertNotEqual(
            normalize_email("a.b@outlook.com"),
            normalize_email("ab@outlook.com"),
        )

    def test_unusable_emails_are_none(self):
        for email in (None, "", "no-at-sign", "@gmail.com", "+tag@gmail.com", "user@", 5):
            with self.subTest(email=email):
                self.assertIsNone(normalize_email(email))

    def test_quota_identity_prefers_inbox_over_account_id(self):
        first = quota_identity({"id": "a1", "email": "Pat+one@gmail.com"})
        again = quota_identity({"id": "b2", "email": "p.at@gmail.com"})

        # A new account for the same inbox shares the allowance.
        self.assertEqual(first, again)
        self.assertEqual(first, "email:pat@gmail.com")
        self.assertEqual(quota_identity({"id": "c3"}), "user:c3")
        self.assertEqual(quota_identity({"id": "c3", "email": ""}), "user:c3")

    def test_account_field_is_hashed_and_stable(self):
        field = account_field(USER)

        self.assertTrue(field.startswith("account:"))
        self.assertNotIn(USER, field)
        self.assertEqual(field, account_field(USER))
        self.assertNotEqual(field, account_field("someone-else"))

    def test_unexpected_response_blocks_ai(self):
        for payload in (
            {"result": True},
            {"result": 3},
            {"error": "example error"},
            {},
        ):
            with self.subTest(payload=payload):
                with patch(
                    "daily_quota.urlopen",
                    return_value=self.mock_response(payload),
                ):
                    with self.assertRaises(QuotaStoreUnavailable):
                        reserve_ai_attempt(USER)

    def test_command_uses_toronto_date_account_and_limits(self):
        fixed_time = datetime(
            2026, 10, 28, 23, 59,
            tzinfo=ZoneInfo("America/Toronto"),
        )

        with patch("daily_quota.datetime") as clock:
            clock.now.return_value = fixed_time

            with patch(
                "daily_quota.urlopen",
                return_value=self.mock_response({"result": 1}),
            ) as send:
                reserve_ai_attempt(USER)

        clock.now.assert_called_once_with(ZoneInfo("America/Toronto"))

        request = send.call_args.args[0]
        command = json.loads(request.data)

        self.assertEqual(command[0], "EVAL")
        self.assertEqual(command[2], "1")
        self.assertEqual(command[3], "talktracker:ai-quota:2026-10-28")
        self.assertEqual(command[4], account_field(USER))
        self.assertEqual(command[5:], ["20", "3"])


if __name__ == "__main__":
    unittest.main()