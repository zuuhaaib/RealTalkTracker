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

// The same gap written out for sentences: "4 hours", "36 minutes".
export function durationInWords(seconds: number | null) {
  if (seconds === null) return "some time";
  if (seconds < 60) {
    const whole = Math.round(seconds);
    return `${whole} ${whole === 1 ? "second" : "seconds"}`;
  }
  if (seconds < 3600) {
    const minutes = Math.round(seconds / 60);
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
  }
  if (seconds < 86400) {
    const hours = Number((seconds / 3600).toFixed(1));
    return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  }
  const days = Number((seconds / 86400).toFixed(1));
  return `${days} ${days === 1 ? "day" : "days"}`;
}

// 22 -> "10 pm"
export function formatHour(hour: number | null) {
  if (hour === null) return "n/a";

  const suffix = hour >= 12 ? "pm" : "am";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;

  return `${displayHour} ${suffix}`;
}

// "2025-06" -> "june 2025"
export function formatMonth(month: string | null) {
  if (!month) return "n/a";

  const [year, monthNumber] = month.split("-");
  const date = new Date(Number(year), Number(monthNumber) - 1);

  return date.toLocaleString("en-US", { month: "long", year: "numeric" }).toLowerCase();
}
