import type { AnalyzeResponse } from "../types/analysis";
import { formatDuration } from "../lib/format";
import { SectionHeading, stagger } from "./ui";

// Share-bar colours, in message order: the accent, ink, then greys.
const shareColors = ["var(--accent)", "var(--ink)", "#8f8d87", "#c2bfb7", "#5f5e5a", "#dedbd3"];

type Row = {
  label: string;
  value: (name: string) => number | null;
  show: (value: number | null) => string;
  // Which end of the row wins: the most, or the least (fastest reply).
  best: "max" | "min";
};

// The numbers, head to head: one row per stat, one column per person, and
// the winner of each row in the accent colour so it can be read at a glance.
export default function ParticipantStatsSection({
  statistics,
  behaviorByName,
  idPrefix = "",
}: {
  statistics: AnalyzeResponse["statistics"];
  behaviorByName: AnalyzeResponse["behavior"];
  idPrefix?: string;
}) {
  const participants = Object.entries(statistics.participants).sort((a, b) => b[1].messages - a[1].messages);
  const names = participants.map(([name]) => name);
  const stats = Object.fromEntries(participants);
  const isGroup = participants.length > 2;

  const count = (value: number | null) => (value === null ? "n/a" : value.toLocaleString());

  const rows: Row[] = [
    { label: "messages", value: (n) => stats[n].messages, show: count, best: "max" },
    { label: "words", value: (n) => stats[n].words, show: count, best: "max" },
    { label: "words per message", value: (n) => stats[n].averageWordsPerMessage, show: count, best: "max" },
    {
      label: isGroup ? "jumps in after" : "replies after",
      value: (n) => behaviorByName[n]?.medianResponseTimeSeconds ?? null,
      show: formatDuration,
      best: "min",
    },
    { label: "double texts", value: (n) => behaviorByName[n]?.doubleTexts ?? 0, show: count, best: "max" },
    { label: "started it", value: (n) => behaviorByName[n]?.conversationStarts ?? 0, show: count, best: "max" },
  ];

  const winner = (row: Row) => {
    const values = names.map((name) => row.value(name)).filter((value): value is number => value !== null);
    if (values.length < 2) return null;
    const target = row.best === "max" ? Math.max(...values) : Math.min(...values);
    // Ties and all-zero rows have no winner.
    if (values.filter((value) => value === target).length > 1) return null;
    if (row.best === "max" && target === 0) return null;
    return target;
  };

  return (
    <section aria-labelledby={`${idPrefix}numbers-title`}>
      <SectionHeading id={`${idPrefix}numbers-title`} title="the numbers." intro="no ai involved yet. just counting." />

      {/* Who said how much, as one bar. */}
      <div data-reveal>
        <div aria-hidden="true" className="flex h-4 gap-1 overflow-hidden rounded-full">
          {participants.map(([name, person], index) => (
            <span
              key={name}
              className="h-full first:rounded-l-full last:rounded-r-full"
              style={{ width: `${person.messagePercentage}%`, background: shareColors[index % shareColors.length] }}
            />
          ))}
        </div>
        <ul aria-label="share of messages" className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-lg">
          {participants.map(([name, person], index) => (
            <li key={name} className="flex min-w-0 items-center gap-2">
              <span
                aria-hidden="true"
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ background: shareColors[index % shareColors.length] }}
              />
              <span className="min-w-0 font-semibold [overflow-wrap:anywhere]">{name}</span>
              <span className="tabular text-muted">{person.messagePercentage}%</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Phones: one small card per stat, everyone listed, leader highlighted. */}
      <ul className="mt-10 grid gap-3 sm:hidden">
        {rows.map((row) => {
          const best = winner(row);

          return (
            <li key={row.label} data-reveal className="rounded-3xl bg-bg-2 p-5">
              <h3 className="text-base text-muted">{row.label}</h3>
              <dl className="mt-2 space-y-1.5">
                {names.map((name) => {
                  const value = row.value(name);
                  const leads = best !== null && value === best;

                  return (
                    <div key={name} className="flex items-baseline justify-between gap-4">
                      <dt className="min-w-0 text-lg [overflow-wrap:break-word]">{name}</dt>
                      <dd className={`shrink-0 text-xl font-bold tabular ${leads ? "text-accent-text" : ""}`}>
                        {row.show(value)}
                        {leads && <span className="sr-only"> (leads)</span>}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </li>
          );
        })}
      </ul>

      {/* Wider screens: head to head. Scrolls sideways for big groups. */}
      <div data-reveal style={stagger(1)} className="relative mt-10 hidden overflow-x-auto sm:block">
        <table className="w-full border-separate border-spacing-y-1.5 text-left">
          <caption className="sr-only">each person’s numbers; the highlighted value leads its row</caption>
          <thead>
            <tr>
              <td className="sticky left-0 z-10 w-0 bg-bg" />
              {names.map((name) => (
                <th
                  key={name}
                  scope="col"
                  className="max-w-52 min-w-36 px-4 pb-2 text-right align-bottom text-xl leading-tight font-bold [overflow-wrap:break-word]"
                >
                  {name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const best = winner(row);

              return (
                <tr key={row.label} className="bg-bg-2">
                  <th
                    scope="row"
                    className="sticky left-0 z-10 rounded-l-2xl bg-bg-2 py-3 pr-4 pl-5 text-lg font-normal whitespace-nowrap text-muted"
                  >
                    {row.label}
                  </th>
                  {names.map((name) => {
                    const value = row.value(name);
                    const leads = best !== null && value === best;

                    return (
                      <td
                        key={name}
                        className={`px-4 py-3 text-right text-2xl font-bold tabular last:rounded-r-2xl ${
                          leads ? "text-accent-text" : ""
                        }`}
                      >
                        {row.show(value)}
                        {leads && <span className="sr-only"> (leads)</span>}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <details className="mt-6">
        <summary className="cursor-pointer list-none text-lg [&::-webkit-details-marker]:hidden">
          <span className="text-link">how this is counted</span>
        </summary>
        <ul className="mt-3 max-w-[60ch] space-y-2 text-lg text-muted">
          <li>
            {isGroup
              ? "“jumps in after” is the median time between someone else’s message and theirs. nobody can tell who they were answering."
              : "“replies after” is the median time between the other person’s message and theirs. gaps of six hours or more don’t count."}
          </li>
          <li>double texts are extra messages in a row before anyone else talks. a burst of six counts as five.</li>
          <li>“started it” counts the first message, plus any message after six or more hours of silence.</li>
          <li>words skip placeholders like “image omitted”.</li>
        </ul>
      </details>
    </section>
  );
}
