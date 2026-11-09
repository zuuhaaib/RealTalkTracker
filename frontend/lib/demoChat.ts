// The fictional conversation on the landing page. The findings shown under
// it are calculated from these messages with the same definitions the
// backend uses, so the preview always adds up.

export type DemoMessage = {
  sender: "milo" | "sam";
  text: string;
  // Local time, ISO format.
  at: string;
};

export const demoMessages: DemoMessage[] = [
  { sender: "milo", text: "you still coming over later", at: "2025-05-17T12:08" },
  { sender: "sam", text: "yeah what time", at: "2025-05-17T16:08" },
  { sender: "milo", text: "7", at: "2025-05-17T16:09" },
  { sender: "milo", text: "also how feasible is it to have a pet horse", at: "2025-05-17T16:09" },
  { sender: "sam", text: "in your apartment?", at: "2025-05-17T16:09" },
  { sender: "milo", text: "he’d be an outdoor horse", at: "2025-05-17T16:09" },
  { sender: "sam", text: "you have a balcony", at: "2025-05-17T16:09" },
  { sender: "milo", text: "yeah he’d have to be chill about that", at: "2025-05-17T16:10" },
  { sender: "sam", text: "milo do you already have a horse", at: "2025-05-17T16:10" },
  { sender: "milo", text: "can you come at 6 actually", at: "2025-05-17T16:10" },
];

// Six hours of silence ends a conversation, so shorter waits count as
// reply gaps.
const SILENCE_SECONDS = 6 * 60 * 60;

type Sender = DemoMessage["sender"];

export type DemoStats = {
  messages: number;
  share: number;
  slowestReplySeconds: number | null;
};

export function getDemoStats(messages: DemoMessage[] = demoMessages) {
  const counts: Record<Sender, number> = { milo: 0, sam: 0 };
  const gaps: Record<Sender, number[]> = { milo: [], sam: [] };

  messages.forEach((message, index) => {
    counts[message.sender] += 1;

    const previous = messages[index - 1];
    if (!previous || previous.sender === message.sender) return;

    const gap = (Date.parse(message.at) - Date.parse(previous.at)) / 1000;
    if (gap < SILENCE_SECONDS) gaps[message.sender].push(gap);
  });

  const build = (sender: Sender): DemoStats => ({
    messages: counts[sender],
    share: Math.round((counts[sender] / messages.length) * 100),
    slowestReplySeconds: gaps[sender].length ? Math.max(...gaps[sender]) : null,
  });

  return {
    milo: build("milo"),
    sam: build("sam"),
    horseMentions: messages.filter((message) => /\bhorse\b/i.test(message.text)).length,
  };
}

// "16:08" -> "4:08 pm"
export function formatClock(at: string) {
  const [hours, minutes] = at.slice(11, 16).split(":").map(Number);
  const suffix = hours >= 12 ? "pm" : "am";

  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}
