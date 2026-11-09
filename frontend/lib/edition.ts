import type { AnalyzeResponse } from "../types/analysis";
import { durationInWords } from "./format";

// Participants, most messages first.
export function byMessages(data: AnalyzeResponse) {
  return Object.entries(data.statistics.participants).sort((a, b) => b[1].messages - a[1].messages);
}

export type Fact = {
  id: string;
  label: string;
  name: string;
  detail: string;
};

// The tl;dr: the four things people actually want to know, each one a
// number from the analysis (or the AI's verdict, when there is one).
export function summarize(data: AnalyzeResponse): Fact[] {
  const isGroup = Object.keys(data.statistics.participants).length > 2;
  const behavior = Object.entries(data.behavior);
  const facts: Fact[] = [];

  const [topName, top] = byMessages(data)[0];
  facts.push({
    id: "carrying",
    label: "carrying the chat",
    name: topName,
    detail: `${Math.round(top.messagePercentage)}% of all messages`,
  });

  const timed = behavior.filter(([, b]) => b.medianResponseTimeSeconds !== null);
  const slowest = [...timed].sort(
    (a, b) => (b[1].medianResponseTimeSeconds ?? 0) - (a[1].medianResponseTimeSeconds ?? 0),
  )[0];
  if (slowest) {
    facts.push({
      id: "slowest",
      label: isGroup ? "slowest to jump in" : "slowest to reply",
      name: slowest[0],
      detail: `usually ${durationInWords(slowest[1].medianResponseTimeSeconds)}`,
    });
  }

  const starter = [...behavior].sort((a, b) => b[1].conversationStarts - a[1].conversationStarts)[0];
  if (starter && starter[1].conversationStarts > 0) {
    facts.push({
      id: "starter",
      label: "starts it",
      name: starter[0],
      detail: `${starter[1].conversationStarts.toLocaleString()} ${
        starter[1].conversationStarts === 1 ? "time" : "times"
      }`,
    });
  }

  if (!("error" in data.aiAnalysis)) {
    facts.push({
      id: "funniest",
      label: "the funny one",
      name: data.aiAnalysis.funniest.person,
      detail: `says a robot, ${data.aiAnalysis.funniest.confidence}% sure`,
    });
  } else if (data.awards.doubleTexter) {
    facts.push({
      id: "double",
      label: "double texter",
      name: data.awards.doubleTexter,
      detail: "one message was never enough",
    });
  }

  return facts;
}
