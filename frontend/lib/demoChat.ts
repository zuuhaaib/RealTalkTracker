// The fictional conversation on the landing page. Every number printed
// about them is calculated from these messages with the same rules the
// backend uses (six hours of silence starts a new conversation), so the
// receipts always add up.

export type DemoMessage = {
  sender: string;
  text: string;
  // Local time, ISO format.
  at: string;
};

export type DemoChat = {
  id: string;
  people: [string, string];
  receiptNumber: string;
  messages: DemoMessage[];
  // The running bit this chat keeps returning to.
  gag: { label: string; pattern: RegExp };
};

export const horseChat: DemoChat = {
  id: "horse",
  people: ["milo", "sam"],
  receiptNumber: "0017",
  gag: { label: "horse mentions", pattern: /\bhorse\b/i },
  messages: [
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
  ],
};

// Six hours of silence ends a conversation, so shorter waits count as
// reply gaps.
const SILENCE_SECONDS = 6 * 60 * 60;

function seconds(from: string, to: string) {
  return (Date.parse(to) - Date.parse(from)) / 1000;
}

function median(values: number[]) {
  if (!values.length) return null;

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

export type PersonStats = {
  name: string;
  messages: number;
  share: number;
  words: number;
  doubleTexts: number;
  conversationStarts: number;
  replyGaps: number[];
  slowestReplySeconds: number | null;
  medianReplySeconds: number | null;
  gagMentions: number;
};

export function getChatStats(chat: DemoChat) {
  const people = Object.fromEntries(
    chat.people.map((name) => [
      name,
      {
        name,
        messages: 0,
        share: 0,
        words: 0,
        doubleTexts: 0,
        conversationStarts: 0,
        replyGaps: [] as number[],
        slowestReplySeconds: null as number | null,
        medianReplySeconds: null as number | null,
        gagMentions: 0,
      },
    ]),
  ) as Record<string, PersonStats>;

  chat.messages.forEach((message, index) => {
    const person = people[message.sender];
    person.messages += 1;
    person.words += message.text.split(/\s+/).filter(Boolean).length;
    if (chat.gag.pattern.test(message.text)) person.gagMentions += 1;

    const previous = chat.messages[index - 1];

    if (!previous || seconds(previous.at, message.at) >= SILENCE_SECONDS) {
      person.conversationStarts += 1;
    } else if (previous.sender === message.sender) {
      person.doubleTexts += 1;
    } else {
      person.replyGaps.push(seconds(previous.at, message.at));
    }
  });

  const list = chat.people.map((name) => {
    const person = people[name];
    person.share = Math.round((person.messages / chat.messages.length) * 100);
    person.slowestReplySeconds = person.replyGaps.length ? Math.max(...person.replyGaps) : null;
    person.medianReplySeconds = median(person.replyGaps);
    return person;
  });

  const [first, second] = list;
  const carrying = first.messages >= second.messages ? first : second;
  const slowest =
    (first.slowestReplySeconds ?? -1) >= (second.slowestReplySeconds ?? -1) ? first : second;
  const doubleTexter = first.doubleTexts >= second.doubleTexts ? first : second;

  return {
    people: list,
    carrying,
    slowest,
    doubleTexter,
    gagMentions: first.gagMentions + second.gagMentions,
  };
}

// "16:08" -> "4:08 pm"
export function formatClock(at: string) {
  const [hours, minutes] = at.slice(11, 16).split(":").map(Number);
  const suffix = hours >= 12 ? "pm" : "am";

  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}
