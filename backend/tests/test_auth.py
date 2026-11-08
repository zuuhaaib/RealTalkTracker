import io
import os
import unittest
from unittest.mock import patch

import httpx
from fastapi import HTTPException, UploadFile

import auth
import main
from request_limits import AnalysisLimiter


CHAT = (
    "[2025-05-16, 4:23:03 AM] Alex: hello\n"
    "[2025-05-16, 4:24:03 AM] Sam: hey"
).encode("utf-8")

SUPABASE_ENV = {
    "SUPABASE_URL": "https://example.supabase.co/",
    "SUPABASE_PUBLISHABLE_KEY": "test-publishable-key",
}


def fake_supabase(handler):
    """Route the sign-in check's HTTP calls to handler, never the network."""
    real_client = httpx.AsyncClient

    def make_client(*args, **kwargs):
        kwargs["transport"] = httpx.MockTransport(handler)
        return real_client(*args, **kwargs)

    return patch.object(auth.httpx, "AsyncClient", side_effect=make_client)


class BearerTokenTests(unittest.TestCase):
    def test_reads_bearer_tokens_only(self):
        self.assertEqual(auth.read_bearer_token("Bearer abc"), "abc")
        self.assertEqual(auth.read_bearer_token("bearer  abc "), "abc")
        self.assertIsNone(auth.read_bearer_token(None))
        self.assertIsNone(auth.read_bearer_token(""))
        self.assertIsNone(auth.read_bearer_token("Basic abc"))
        self.assertIsNone(auth.read_bearer_token("Bearer "))


class VerifyUserTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        env_patch = patch.dict(os.environ, SUPABASE_ENV)
        env_patch.start()
        self.addCleanup(env_patch.stop)

    async def assert_rejected(self, authorization, status_code):
        with self.assertRaises(HTTPException) as caught:
            await auth.verify_user(authorization)

        self.assertEqual(caught.exception.status_code, status_code)

    async def test_missing_token_is_401_without_calling_supabase(self):
        calls = []

        with fake_supabase(lambda request: calls.append(request)):
            await self.assert_rejected(None, 401)
            await self.assert_rejected("Basic abc", 401)

        self.assertEqual(calls, [])

    async def test_unconfigured_server_is_503(self):
        with patch.dict(os.environ, {"SUPABASE_URL": ""}):
            await self.assert_rejected("Bearer abc", 503)

    async def test_valid_token_returns_the_user(self):
        seen = {}

        def handler(request):
            seen["url"] = str(request.url)
            seen["apikey"] = request.headers.get("apikey")
            seen["authorization"] = request.headers.get("authorization")
            return httpx.Response(200, json={"id": "user-1", "email": "a@b.c"})

        with fake_supabase(handler):
            user = await auth.verify_user("Bearer good-token")

        self.assertEqual(user["id"], "user-1")
        # The trailing slash in SUPABASE_URL is ignored.
        self.assertEqual(seen["url"], "https://example.supabase.co/auth/v1/user")
        self.assertEqual(seen["apikey"], "test-publishable-key")
        self.assertEqual(seen["authorization"], "Bearer good-token")

    async def test_rejected_or_odd_tokens_are_401(self):
        responses = [
            httpx.Response(401, json={"msg": "invalid JWT"}),
            httpx.Response(403, json={"msg": "forbidden"}),
            httpx.Response(200, json={}),
            httpx.Response(200, text="not json"),
        ]

        for response in responses:
            with self.subTest(status=response.status_code):
                with fake_supabase(lambda request, r=response: r):
                    await self.assert_rejected("Bearer bad-token", 401)

    async def test_supabase_trouble_is_503(self):
        def unreachable(request):
            raise httpx.ConnectError("down", request=request)

        with fake_supabase(unreachable):
            await self.assert_rejected("Bearer abc", 503)

        with fake_supabase(lambda request: httpx.Response(500)):
            await self.assert_rejected("Bearer abc", 503)


class AnalyzeRequiresSignInTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        limiter_patch = patch.object(main, "analysis_limiter", AnalysisLimiter())
        limiter_patch.start()
        self.addCleanup(limiter_patch.stop)

        ai_patch = patch.object(
            main,
            "analyze_conversation_with_ai",
            return_value={"error": "AI mocked for testing."},
        )
        self.ai_mock = ai_patch.start()
        self.addCleanup(ai_patch.stop)

        env_patch = patch.dict(os.environ, SUPABASE_ENV)
        env_patch.start()
        self.addCleanup(env_patch.stop)

    async def upload(self, authorization):
        file = UploadFile(filename="chat.txt", file=io.BytesIO(CHAT))
        return await main.analyze_chat(file=file, authorization=authorization)

    async def test_signed_out_uploads_are_rejected_before_any_work(self):
        # More rejected uploads than the five-per-minute allowance.
        for _ in range(7):
            with self.assertRaises(HTTPException) as caught:
                await self.upload(None)

            self.assertEqual(caught.exception.status_code, 401)

        self.assertEqual(self.ai_mock.call_count, 0)

        # Nothing was consumed: a signed-in user still gets five analyses.
        ok = lambda request: httpx.Response(200, json={"id": "user-1"})

        with fake_supabase(ok):
            for _ in range(5):
                result = await self.upload("Bearer good-token")
                self.assertEqual(result["messageCount"], 2)

        self.assertEqual(self.ai_mock.call_count, 5)

    async def test_expired_session_is_rejected(self):
        expired = lambda request: httpx.Response(401, json={"msg": "expired"})

        with fake_supabase(expired):
            with self.assertRaises(HTTPException) as caught:
                await self.upload("Bearer old-token")

        self.assertEqual(caught.exception.status_code, 401)
        self.assertEqual(self.ai_mock.call_count, 0)


if __name__ == "__main__":
    unittest.main()
