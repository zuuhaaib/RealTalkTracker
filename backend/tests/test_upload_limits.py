import io
import unittest
from unittest.mock import patch

from fastapi import HTTPException, UploadFile

import main
from request_limits import AnalysisLimiter


CHAT = (
    "[2025-05-16, 4:23:03 AM] Alex: hello\n"
    "[2025-05-16, 4:24:03 AM] Sam: hey"
).encode("utf-8")


class UploadLimitTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        # Each test gets fresh limits.
        limiter_patch = patch.object(
            main,
            "analysis_limiter",
            AnalysisLimiter(),
        )
        limiter_patch.start()
        self.addCleanup(limiter_patch.stop)

        # Never call OpenAI or Upstash during these tests.
        ai_patch = patch.object(
            main,
            "analyze_conversation_with_ai",
            return_value={"error": "AI mocked for testing."},
        )
        self.ai_mock = ai_patch.start()
        self.addCleanup(ai_patch.stop)

        # Sign-in is covered in test_auth.py; treat every upload here as
        # coming from a signed-in user.
        # The bearer token doubles as the account's email name.
        async def fake_verify(authorization):
            name = authorization.removeprefix("Bearer ")
            return {"id": f"id-{name}", "email": f"{name}@example.com"}

        auth_patch = patch.object(main, "verify_user", side_effect=fake_verify)
        auth_patch.start()
        self.addCleanup(auth_patch.stop)

    async def upload(self, filename, contents, user="user-1"):
        file = UploadFile(
            filename=filename,
            file=io.BytesIO(contents),
        )
        return await main.analyze_chat(
            file=file,
            authorization=f"Bearer {user}",
        )

    async def test_invalid_uploads_do_not_use_rate_allowance(self):
        invalid_files = [
            ("wrong.bin", b"hello"),
            ("empty.txt", b""),
            ("whitespace.txt", b"   \n"),
            ("invalid-encoding.txt", b"\xff"),
            ("not-a-chat.txt", b"no chat messages here"),
        ]

        # More than five invalid uploads must not exhaust the allowance
        # or leak either of the two concurrency slots.
        for _ in range(2):
            for filename, contents in invalid_files:
                with self.subTest(filename=filename):
                    with self.assertRaises(HTTPException) as caught:
                        await self.upload(filename, contents)

                    self.assertEqual(caught.exception.status_code, 400)

        result = await self.upload("chat.txt", CHAT)

        self.assertEqual(result["messageCount"], 2)
        self.assertEqual(self.ai_mock.call_count, 1)

    async def test_response_has_only_fields_the_site_uses(self):
        result = await self.upload("chat.txt", CHAT)

        self.assertEqual(
            set(result),
            {
                "platform",
                "messageCount",
                "statistics",
                "behavior",
                "awards",
                "activity",
                "aiAnalysis",
            },
        )

        # The AI still gets the text statistics.
        self.assertIn("Alex", self.ai_mock.call_args.args[3])

    async def test_sixth_recognized_chat_is_rate_limited(self):
        for _ in range(5):
            result = await self.upload("chat.txt", CHAT)
            self.assertEqual(result["messageCount"], 2)

        with self.assertRaises(HTTPException) as caught:
            await self.upload("chat.txt", CHAT)

        self.assertEqual(caught.exception.status_code, 429)
        self.assertEqual(self.ai_mock.call_count, 5)

    async def test_accounts_have_separate_minute_allowances(self):
        for _ in range(5):
            await self.upload("chat.txt", CHAT, user="user-1")

        with self.assertRaises(HTTPException) as caught:
            await self.upload("chat.txt", CHAT, user="user-1")

        self.assertEqual(caught.exception.status_code, 429)
        self.assertIn("easy there", caught.exception.detail)

        # Someone else is not held up by user-1.
        result = await self.upload("chat.txt", CHAT, user="user-2")
        self.assertEqual(result["messageCount"], 2)

    async def test_ai_step_receives_the_account(self):
        await self.upload("chat.txt", CHAT, user="user-7")

        self.assertEqual(
            self.ai_mock.call_args.kwargs["account"],
            "email:user-7@example.com",
        )

    async def test_email_aliases_share_the_minute_allowance(self):
        for index in range(5):
            await self.upload("chat.txt", CHAT, user=f"pat+{index}")

        with self.assertRaises(HTTPException) as caught:
            await self.upload("chat.txt", CHAT, user="pat+another")

        self.assertEqual(caught.exception.status_code, 429)

    async def test_shared_minute_allowance_caps_everyone(self):
        limit = main.SHARED_MINUTE_LIMIT

        for index in range(limit):
            await self.upload("chat.txt", CHAT, user=f"user-{index}")

        with self.assertRaises(HTTPException) as caught:
            await self.upload("chat.txt", CHAT, user="newcomer")

        self.assertEqual(caught.exception.status_code, 429)
        self.assertIn("shared analysis allowance", caught.exception.detail)
        self.assertEqual(self.ai_mock.call_count, limit)

    async def test_rejected_request_does_not_charge_other_buckets(self):
        for _ in range(5):
            await self.upload("chat.txt", CHAT, user="user-1")

        for _ in range(3):
            with self.assertRaises(HTTPException):
                await self.upload("chat.txt", CHAT, user="user-1")

        # user-1's rejected tries didn't use the shared allowance.
        for index in range(main.SHARED_MINUTE_LIMIT - 5):
            await self.upload("chat.txt", CHAT, user=f"other-{index}")

    async def test_busy_server_does_not_consume_rate_allowance(self):
        main.analysis_limiter.acquire_slot()
        main.analysis_limiter.acquire_slot()

        try:
            with self.assertRaises(HTTPException) as caught:
                await self.upload("chat.txt", CHAT)

            self.assertEqual(caught.exception.status_code, 503)
        finally:
            main.analysis_limiter.release()
            main.analysis_limiter.release()

        for _ in range(5):
            result = await self.upload("chat.txt", CHAT)
            self.assertEqual(result["messageCount"], 2)

        self.assertEqual(self.ai_mock.call_count, 5)


if __name__ == "__main__":
    unittest.main()