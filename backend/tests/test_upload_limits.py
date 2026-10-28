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

    async def upload(self, filename, contents):
        file = UploadFile(
            filename=filename,
            file=io.BytesIO(contents),
        )
        return await main.analyze_chat(file=file)

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

    async def test_sixth_recognized_chat_is_rate_limited(self):
        for _ in range(5):
            result = await self.upload("chat.txt", CHAT)
            self.assertEqual(result["messageCount"], 2)

        with self.assertRaises(HTTPException) as caught:
            await self.upload("chat.txt", CHAT)

        self.assertEqual(caught.exception.status_code, 429)
        self.assertEqual(self.ai_mock.call_count, 5)

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