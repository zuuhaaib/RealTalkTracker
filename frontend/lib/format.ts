// A gap between messages in words: "45 sec", "12 min", "4 hr", "1.5 days".
// Shared by the homepage demo and real results so both read the same way.
export function formatDuration(seconds: number | null) {
  if (seconds === null) return "n/a";
  if (seconds < 60) return `${Math.round(seconds)} sec`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} min`;

  // Number(...) drops a trailing ".0": "4 hr", not "4.0 hr".
  if (seconds < 86400) return `${Number((seconds / 3600).toFixed(1))} hr`;

  const days = Number((seconds / 86400).toFixed(1));

  return `${days} ${days === 1 ? "day" : "days"}`;
}
