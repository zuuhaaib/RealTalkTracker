import json
import unittest
from datetime import datetime
from unittest.mock import MagicMock, patch
from zoneinfo import ZoneInfo

from daily_quota import QuotaStoreUnavailable, reserve_ai_attempt


class DailyQuotaTests(unittest.TestCase):
    def setUp(self):
        self.environment = patch.dict(
            "os.environ",
            {
                "UPSTASH_REDIS_REST_URL": "https://example.upstash.io",
                "UPSTASH_REDIS_REST_TOKEN": "test-token",
                "AI_DAILY_LIMIT": "20",
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

    def test_available_allowance_returns_true(self):
        with patch(
            "daily_quota.urlopen",
            return_value=self.mock_response({"result": 1}),
        ):
            self.assertTrue(reserve_ai_attempt())

    def test_exhausted_allowance_returns_false(self):
        with patch(
            "daily_quota.urlopen",
            return_value=self.mock_response({"result": 0}),
        ):
            self.assertFalse(reserve_ai_attempt())

    def test_network_failure_blocks_ai(self):
        with patch(
            "daily_quota.urlopen",
            side_effect=TimeoutError,
        ) as send:
            with self.assertRaises(QuotaStoreUnavailable):
                reserve_ai_attempt()

            # An uncertain reservation must not be retried.
            self.assertEqual(send.call_count, 1)

    def test_missing_credentials_blocks_ai(self):
        with patch.dict(
            "os.environ",
            {"UPSTASH_REDIS_REST_TOKEN": ""},
        ):
            with self.assertRaises(QuotaStoreUnavailable):
                reserve_ai_attempt()

    def test_zero_limit_does_not_contact_database(self):
        with patch.dict("os.environ", {"AI_DAILY_LIMIT": "0"}):
            with patch("daily_quota.urlopen") as send:
                self.assertFalse(reserve_ai_attempt())
                send.assert_not_called()

    def test_unexpected_response_blocks_ai(self):
        for payload in (
            {"result": True},
            {"result": 2},
            {"error": "example error"},
            {},
        ):
            with self.subTest(payload=payload):
                with patch(
                    "daily_quota.urlopen",
                    return_value=self.mock_response(payload),
                ):
                    with self.assertRaises(QuotaStoreUnavailable):
                        reserve_ai_attempt()

    def test_command_uses_toronto_date_and_configured_limit(self):
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
                reserve_ai_attempt()

        clock.now.assert_called_once_with(ZoneInfo("America/Toronto"))

        request = send.call_args.args[0]
        command = json.loads(request.data)

        self.assertEqual(command[0], "EVAL")
        self.assertEqual(command[3], "talktracker:ai-attempts:2026-10-28")
        self.assertEqual(command[4], "20")


if __name__ == "__main__":
    unittest.main()