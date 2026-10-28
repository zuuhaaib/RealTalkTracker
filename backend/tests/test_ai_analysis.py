import json
import unittest
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import httpx
from openai import APITimeoutError

from analysis import ai_analysis
from analysis.ai_analysis import (
    analyze_conversation_with_ai,
    build_message_sample,
    build_output_schema,
    parse_ai_response,
    read_response,
    select_window_ranges,
)


def chat(count, senders=("Alex", "Sam")):
    return [
        {
            "sender": senders[index % len(senders)],
            "timestamp": f"2025-01-01T00:{index % 60:02d}:00",
            "message": f"message {index}",
        }
        for index in range(count)
    ]


def sampled_texts(sample):
    return [
        msg["message"]
        for excerpt in sample
        for msg in excerpt["messages"]
    ]


def valid_output(names=("Alex", "Sam")):
    return {
        "funniest": {
            "person": names[0],
            "confidence": 62.5,
            "reason": "evidence",
        },
        "participants": [
            {
                "name": name,
                "humorStyle": "dry",
                "textingStyle": "short",
                "summary": "chill",
            }
            for name in names
        ],
        "conversationDynamic": "balanced",
        "recurringTopics": ["food"],
        "insideJokesOrPatterns": [],
        "interestingObservations": ["lots of plans"],
    }


def fake_response(text="", status="completed", output=None, reason=None):
    return SimpleNamespace(
        status=status,
        incomplete_details=SimpleNamespace(reason=reason),
        output=output or [],
        output_text=text,
    )


class WindowSelectionTests(unittest.TestCase):
    def test_empty_input_and_zero_limit(self):
        self.assertEqual(select_window_ranges(0, 200, 10), [])
        self.assertEqual(select_window_ranges(50, 0, 10), [])
        self.assertEqual(build_message_sample([]), [])

    def test_short_chat_is_one_complete_excerpt(self):
        sample = build_message_sample(chat(30))

        self.assertEqual(len(sample), 1)
        self.assertEqual(
            sampled_texts(sample),
            [f"message {i}" for i in range(30)],
        )
        self.assertEqual(sample[0]["firstMessageNumber"], 1)
        self.assertEqual(sample[0]["lastMessageNumber"], 30)

    def test_long_chat_uses_spread_contiguous_windows(self):
        ranges = select_window_ranges(5000, 200, 10)

        self.assertEqual(len(ranges), 10)
        self.assertEqual(ranges[0][0], 0)
        self.assertEqual(ranges[-1][1], 5000)

        for start, end in ranges:
            self.assertEqual(end - start, 20)

        # Windows are chronological and never overlap.
        for (_, previous_end), (start, _) in zip(ranges, ranges[1:]):
            self.assertGreater(start, previous_end)

    def test_overlapping_windows_are_merged_without_duplicates(self):
        # Barely more messages than the limit forces touching windows.
        sample = build_message_sample(chat(201))
        texts = sampled_texts(sample)

        self.assertEqual(len(texts), len(set(texts)))
        self.assertLessEqual(len(texts), 200)
        self.assertEqual(texts[0], "message 0")
        self.assertEqual(texts[-1], "message 200")

        numbers = [int(text.split()[1]) for text in texts]
        self.assertEqual(numbers, sorted(numbers))

    def test_small_limits(self):
        self.assertEqual(select_window_ranges(100, 1, 10), [(0, 1)])

        ranges = select_window_ranges(100, 3, 10)

        self.assertEqual(ranges, [(0, 1), (50, 51), (99, 100)])

    def test_message_and_character_limits(self):
        messages = chat(1000)
        messages[0]["message"] = "x" * 2000

        sample = build_message_sample(messages)
        texts = sampled_texts(sample)

        self.assertLessEqual(len(texts), 200)
        self.assertEqual(len(texts[0]), 500)

    def test_media_only_and_deleted_are_skipped_but_captions_kept(self):
        messages = chat(3)
        messages[0]["message"] = "<Media omitted>"
        messages[1]["message"] = "This message was deleted"
        messages[2]["message"] = "<attached: cat.jpg>\nlook at this cat"

        self.assertEqual(
            sampled_texts(build_message_sample(messages)),
            ["look at this cat"],
        )


class SchemaTests(unittest.TestCase):
    def assert_strict(self, schema):
        if schema.get("type") == "object":
            self.assertIs(schema["additionalProperties"], False)
            self.assertEqual(
                set(schema["required"]),
                set(schema["properties"]),
            )

            for child in schema["properties"].values():
                self.assert_strict(child)
        elif schema.get("type") == "array":
            self.assert_strict(schema["items"])

    def test_schema_is_strict_and_uses_detected_names(self):
        schema = build_output_schema({"Sam", "Alex"})

        self.assert_strict(schema)

        participants = schema["properties"]["participants"]
        self.assertEqual(participants["minItems"], 2)
        self.assertEqual(participants["maxItems"], 2)
        self.assertEqual(
            participants["items"]["properties"]["name"]["enum"],
            ["Alex", "Sam"],
        )

    def test_huge_groups_fall_back_to_plain_names(self):
        names = {f"person {i}" for i in range(600)}

        schema = build_output_schema(names)
        name_schema = (
            schema["properties"]["participants"]["items"]
            ["properties"]["name"]
        )

        self.assertNotIn("enum", name_schema)


class ParseTests(unittest.TestCase):
    names = {"Alex", "Sam"}

    def parse(self, data):
        return parse_ai_response(json.dumps(data), self.names)

    def test_valid_output_becomes_name_keyed_contract(self):
        result = self.parse(valid_output())

        self.assertEqual(set(result["participants"]), self.names)
        self.assertEqual(
            result["participants"]["Sam"],
            {"humorStyle": "dry", "textingStyle": "short", "summary": "chill"},
        )
        self.assertEqual(result["funniest"]["person"], "Alex")

    def test_invalid_outputs_are_rejected(self):
        cases = {}

        data = valid_output()
        data["participants"].append(dict(data["participants"][0]))
        cases["duplicate name"] = data

        data = valid_output()
        data["participants"].pop()
        cases["missing participant"] = data

        data = valid_output()
        data["funniest"]["person"] = "Jordan"
        cases["unknown funniest"] = data

        data = valid_output()
        data["funniest"]["confidence"] = True
        cases["boolean confidence"] = data

        data = valid_output()
        data["funniest"]["confidence"] = 101
        cases["out of range"] = data

        data = valid_output()
        del data["recurringTopics"]
        cases["missing list"] = data

        data = valid_output()
        data["participants"][0]["summary"] = None
        cases["null field"] = data

        for label, data in cases.items():
            with self.subTest(label):
                self.assertIn("error", self.parse(data))

    def test_non_finite_confidence_is_rejected(self):
        text = json.dumps(valid_output()).replace("62.5", "NaN")

        self.assertIn("error", parse_ai_response(text, self.names))

    def test_unreadable_json(self):
        self.assertIn("error", parse_ai_response("{nope", self.names))


class ReadResponseTests(unittest.TestCase):
    names = {"Alex", "Sam"}

    def test_refusal_is_reported(self):
        response = fake_response(output=[
            SimpleNamespace(
                type="message",
                content=[SimpleNamespace(type="refusal", refusal="no")],
            )
        ])

        result = read_response(response, self.names)

        self.assertEqual(
            result,
            {"error": "The AI declined to analyze this chat."},
        )

    def test_incomplete_is_reported(self):
        response = fake_response(
            text='{"funniest":',
            status="incomplete",
            reason="max_output_tokens",
        )

        self.assertIn("error", read_response(response, self.names))

    def test_failed_status_is_reported(self):
        response = fake_response(status="failed")

        self.assertIn("error", read_response(response, self.names))

    def test_completed_output_is_parsed(self):
        response = fake_response(text=json.dumps(valid_output()))

        result = read_response(response, self.names)

        self.assertEqual(set(result["participants"]), self.names)


class AnalyzeConversationTests(unittest.TestCase):
    def run_analysis(self, messages, response=None, side_effect=None):
        names = sorted({msg["sender"] for msg in messages})
        statistics = {"participants": {name: {} for name in names}}
        text_stats = {
            name: {"longestMessage": {"text": "x", "characters": 1}}
            for name in names
        }

        client = MagicMock()
        client.responses.create.return_value = response
        client.responses.create.side_effect = side_effect

        with (
            patch.object(ai_analysis, "get_client", return_value=client),
            patch.object(
                ai_analysis,
                "reserve_ai_attempt",
                return_value=True,
            ),
        ):
            result = analyze_conversation_with_ai(
                messages, statistics, {}, text_stats, {}, [],
            )

        return result, client

    def test_request_uses_strict_schema_and_returns_contract(self):
        result, client = self.run_analysis(
            chat(10),
            fake_response(text=json.dumps(valid_output())),
        )

        kwargs = client.responses.create.call_args.kwargs
        text_format = kwargs["text"]["format"]

        self.assertEqual(text_format["type"], "json_schema")
        self.assertIs(text_format["strict"], True)
        self.assertEqual(set(result["participants"]), {"Alex", "Sam"})
        self.assertEqual(
            result["sample"],
            {"excerpts": 1, "sampledMessages": 10, "readableMessages": 10},
        )

    def test_two_person_prompt_does_not_get_group_rules(self):
        _, client = self.run_analysis(
            chat(10),
            fake_response(text=json.dumps(valid_output())),
        )

        prompt = client.responses.create.call_args.kwargs["input"]

        self.assertNotIn("This is a group chat", prompt)
        self.assertIn("separate excerpts", prompt)

    def test_group_prompt_says_replies_are_unknown(self):
        names = ("Alex", "Sam", "Jo")
        _, client = self.run_analysis(
            chat(12, senders=names),
            fake_response(text=json.dumps(valid_output(names))),
        )

        prompt = client.responses.create.call_args.kwargs["input"]

        self.assertIn("This is a group chat", prompt)
        self.assertIn("not\n  necessarily replying", prompt)

    def test_timeout_is_reported(self):
        timeout = APITimeoutError(
            request=httpx.Request("POST", "https://example.invalid")
        )

        result, _ = self.run_analysis(chat(10), side_effect=timeout)

        self.assertEqual(
            result,
            {"error": "AI analysis took too long. Please try again later."},
        )

    def test_exhausted_quota_makes_no_request(self):
        client = MagicMock()

        with (
            patch.object(ai_analysis, "get_client", return_value=client),
            patch.object(
                ai_analysis,
                "reserve_ai_attempt",
                return_value=False,
            ),
        ):
            result = analyze_conversation_with_ai(
                chat(4),
                {"participants": {"Alex": {}, "Sam": {}}},
                {},
                {},
                {},
                [],
            )

        self.assertIn("error", result)
        client.responses.create.assert_not_called()

    def test_no_readable_text_makes_no_request(self):
        messages = chat(2)

        for msg in messages:
            msg["message"] = "<Media omitted>"

        with patch.object(ai_analysis, "get_client") as get_client:
            result = analyze_conversation_with_ai(
                messages,
                {"participants": {"Alex": {}, "Sam": {}}},
                {},
                {},
                {},
                [],
            )

        self.assertIn("error", result)
        get_client.assert_not_called()


if __name__ == "__main__":
    unittest.main()
