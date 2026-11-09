import type { AnalyzeResponse } from "../types/analysis";
import { formatDuration } from "../lib/format";
import { SectionHeading } from "./ui";

// Identity colours for people in the share bar and on their panels.
// Each clears 3:1 against the cream ground, the bar for graphics.
const personColors = ["#2f5d3a", "#e2632a", "#3b5b8c", "#a8841b", "#b8506a", "#2a8279"];

export default function ParticipantStatsSection({
  statistics,
  behaviorByName,
}: {
  statistics: AnalyzeResponse["statistics"];
  behaviorByName: AnalyzeResponse["behavior"];
}) {
  const participants = Object.entries(statistics.participants);

  // With 3+ people, the next sender isn't necessarily replying to
  // the previous one, so gaps are described as gaps, not replies.
  const isGroup = participants.length > 2;

  const gapLabel = isGroup ? "gap before jumping in" : "reply gap";

  const definitions = [
    {
      term: gapLabel,
      text: isGroup
        ? "median time between someone else’s message and theirs. in a group we can’t tell who they were actually answering."
        : "median time between the other person’s message and theirs. gaps of six hours or more don’t count.",
    },
    {
      term: "consecutive messages",
      text: "extra messages sent in a row before anyone else talks. a burst of six counts as five. no time limit under six hours.",
    },
    {
      term: "conversation starts",
      text: "the very first message, plus any message after six or more hours of silence.",
    },
    {
      term: "words per message",
      text: "readable words divided by all messages, including media-only ones. placeholders like “image omitted” don’t count as words.",
    },
  ];

  return (
    <section aria-labelledby="head-to-head-title">
      <SectionHeading
        id="head-to-head-title"
        title="so who talks more?"
        intro="the cold hard numbers. no AI opinions involved yet."
      />

      {/* Names live in the legend below, so long names never get clipped
          inside narrow bar segments. */}
      <div
        aria-hidden="true"
        className="flex h-3 gap-0.5 overflow-hidden rounded-full bg-panel-2"
      >
        {participants.map(([name, stats], index) => (
          <span
            key={name}
            style={{
              width: `${stats.messagePercentage}%`,
              background: personColors[index % personColors.length],
            }}
          />
        ))}
      </div>

      <ul aria-label="Share of messages" className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {participants.map(([name, stats], index) => (
          <li key={name} className="flex min-w-0 max-w-full items-center gap-2">
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: personColors[index % personColors.length] }}
            />
            <span className="min-w-0 font-medium [overflow-wrap:anywhere]">{name}</span>
            <span className="shrink-0 text-muted tabular-nums">
              {stats.messagePercentage}%
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {participants.map(([name, stats], index) => {
          const behavior = behaviorByName[name];

          return (
            <article key={name} className="card min-w-0 p-5 sm:p-6">
              <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="flex min-w-0 items-center gap-2 font-display text-xl font-semibold tracking-tight sm:text-2xl">
                  <span
                    aria-hidden="true"
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ background: personColors[index % personColors.length] }}
                  />
                  <span className="min-w-0 [overflow-wrap:break-word]">{name}</span>
                </h3>
                <p className="shrink-0 font-display text-xl font-semibold text-muted tabular-nums sm:text-2xl">
                  {stats.messagePercentage}%
                </p>
              </header>

              <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 lg:grid-cols-3">
                <Stat label="messages" value={stats.messages.toLocaleString()} />
                <Stat label="words" value={stats.words.toLocaleString()} />
                <Stat
                  label="words per message"
                  value={stats.averageWordsPerMessage.toString()}
                />
                <Stat
                  label={`median ${gapLabel}`}
                  value={formatDuration(behavior?.medianResponseTimeSeconds ?? null)}
                />
                {/* API key stays doubleTexts; the label says what it counts. */}
                <Stat
                  label="consecutive messages"
                  value={(behavior?.doubleTexts ?? 0).toLocaleString()}
                />
                <Stat
                  label="conversation starts"
                  value={(behavior?.conversationStarts ?? 0).toLocaleString()}
                />
              </dl>
            </article>
          );
        })}
      </div>

      <details className="card mt-4 px-5 py-4 sm:px-6">
        <summary className="cursor-pointer rounded-sm text-sm font-semibold text-accent">
          how we count this, so nobody gets litigated unfairly
        </summary>

        <dl className="mt-4 grid gap-x-10 gap-y-4 pb-1 text-sm leading-relaxed md:grid-cols-2">
          {definitions.map(({ term, text }) => (
            <div key={term}>
              <dt className="font-semibold">{term}</dt>
              <dd className="text-muted">{text}</dd>
            </div>
          ))}
        </dl>
      </details>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    // Values sit on the bottom of the row, so a label that wraps to two
    // lines doesn't push its number out of line with its neighbours.
    <div className="flex min-w-0 flex-col justify-between gap-0.5">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-xl font-semibold tabular-nums [overflow-wrap:anywhere]">
        {value}
      </dd>
    </div>
  );
}
