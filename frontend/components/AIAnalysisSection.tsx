import type { AIAnalysis } from "../types/analysis";
import DonateLink from "./DonateLink";
import Expandable from "./Expandable";
import { SectionHeading, stagger } from "./ui";

// The AI's take. Its answers can run long, so the section shows the
// verdict and a short version of everything, and lets people open the
// rest: the reason is cut to a few lines, each person shows their summary,
// and the longer notes fold away.
export default function AIAnalysisSection({
  analysis,
  idPrefix = "",
}: {
  analysis: AIAnalysis | { error: string };
  idPrefix?: string;
}) {
  if ("error" in analysis) {
    return (
      <section aria-labelledby={`${idPrefix}ai-title`}>
        <SectionHeading id={`${idPrefix}ai-title`} title="the ai left you on read." />
        <p data-reveal className="max-w-[56ch] text-xl text-muted">
          {analysis.error} everything above still counts.
        </p>
        {/* Both daily-limit messages from the backend end with "for today". */}
        {analysis.error.includes("for today") && (
          <div data-reveal className="mt-6">
            <p className="note text-xl">the robot can&rsquo;t afford overtime. api credits aren&rsquo;t free.</p>
            <DonateLink className="mt-4" />
          </div>
        )}
      </section>
    );
  }

  const participants = Object.entries(analysis.participants);

  return (
    <section aria-labelledby={`${idPrefix}ai-title`}>
      <SectionHeading id={`${idPrefix}ai-title`} title="the ai’s take." intro="it has opinions, not a psychology degree." />

      {/* The verdict: one strip. */}
      <div
        data-reveal
        className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 rounded-3xl bg-accent px-6 py-5 sm:px-8"
      >
        <p className="min-w-0 text-xl">
          the funnier one is{" "}
          <span className="say text-[clamp(2.25rem,1.6rem+2.6vw,3.75rem)] [overflow-wrap:anywhere]">
            {analysis.funniest.person}
          </span>
        </p>
        <p className="tabular text-lg">{analysis.funniest.confidence}% sure. didn&rsquo;t earn it.</p>
      </div>

      {/* Why, in a reading column, cut short until asked. */}
      <div data-reveal style={stagger(1)} className="mt-8 max-w-[62ch]">
        <h3 className="text-lg font-bold">why, apparently</h3>
        <Expandable lines={4} className="mt-2 text-xl leading-relaxed [overflow-wrap:anywhere]">
          <p>{analysis.funniest.reason}</p>
        </Expandable>
      </div>

      {/* One line per person; the detail folds away. */}
      <ul className="mt-10 grid gap-3 md:grid-cols-2">
        {participants.map(([name, participant], index) => (
          <li key={name} data-reveal style={stagger(index % 2)} className="min-w-0 rounded-3xl bg-bg-2 p-6">
            <h3 className="say text-[clamp(1.6rem,1.3rem+1.2vw,2.25rem)] [overflow-wrap:anywhere]">{name}</h3>
            <p className="mt-2 text-lg [overflow-wrap:anywhere]">{participant.summary}</p>
            <details className="group mt-3">
              <summary className="cursor-pointer list-none text-base font-semibold [&::-webkit-details-marker]:hidden">
                <span className="text-link">how {name} texts</span>
              </summary>
              <dl className="mt-3 space-y-3 text-base text-muted [overflow-wrap:anywhere]">
                <div>
                  <dt className="font-semibold text-ink">texts like</dt>
                  <dd>{participant.textingStyle}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-ink">funny like</dt>
                  <dd>{participant.humorStyle}</dd>
                </div>
              </dl>
            </details>
          </li>
        ))}
      </ul>

      {/* Everything else, for people who want it. */}
      <details data-reveal className="group mt-3 rounded-3xl bg-bg-2 p-6">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-xl font-semibold [&::-webkit-details-marker]:hidden">
          more from the robot
          <span aria-hidden="true" className="text-accent-text transition-transform duration-300 group-open:rotate-45">
            +
          </span>
        </summary>

        <div className="mt-6 max-w-[62ch]">
          <h3 className="text-lg font-bold">the dynamic</h3>
          <p className="mt-2 text-lg text-muted [overflow-wrap:anywhere]">{analysis.conversationDynamic}</p>
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-3">
          <ShortList title="keeps coming up" items={analysis.recurringTopics} />
          <ShortList title="running jokes" items={analysis.insideJokesOrPatterns} />
          <ShortList title="it also noticed" items={analysis.interestingObservations} />
        </div>

        <p className="mt-6 text-base text-muted">
          {analysis.sample && analysis.sample.sampledMessages !== analysis.sample.readableMessages
            ? `read ${analysis.sample.sampledMessages.toLocaleString()} of ${analysis.sample.readableMessages.toLocaleString()} text messages, in ${analysis.sample.excerpts} excerpts, plus the stats. it didn’t read everything.`
            : "read the text messages plus the stats."}
        </p>
      </details>
    </section>
  );
}

function ShortList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="min-w-0">
      <h3 className="text-lg font-bold">{title}</h3>
      <ul className="mt-2 space-y-2 text-base">
        {items.map((item, index) => (
          <li key={`${item}-${index}`} className="[overflow-wrap:anywhere]">
            <span aria-hidden="true" className="note">
              →{" "}
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
