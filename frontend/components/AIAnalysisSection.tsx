import type { AIAnalysis } from "../types/analysis";
import { SectionHeading } from "./ui";

export default function AIAnalysisSection({
  analysis,
}: {
  analysis: AIAnalysis | { error: string };
}) {
  if ("error" in analysis) {
    return (
      <section aria-labelledby="ai-title" className="card p-6 sm:p-8">
        <h2
          id="ai-title"
          className="font-display text-2xl font-semibold tracking-tight"
        >
          the AI needed a break
        </h2>
        <p className="mt-2 max-w-2xl leading-relaxed text-muted">
          {analysis.error} Your chat statistics are still available above.
        </p>
      </section>
    );
  }

  const participants = Object.entries(analysis.participants);

  return (
    <section aria-labelledby="ai-title">
      <SectionHeading
        id="ai-title"
        title="the AI’s take"
        intro="after careful scientific analysis*"
      />

      {/* VERDICT */}
      <div className="card p-6 sm:p-8">
        <p className="text-muted">the funnier one is apparently</p>
        <p className="mt-1 font-display text-4xl font-semibold tracking-tight text-accent [overflow-wrap:anywhere] sm:text-5xl">
          {analysis.funniest.person}
        </p>
        <p className="mt-2 text-sm text-muted tabular-nums">
          {analysis.funniest.confidence}% confident
        </p>

        <blockquote className="mt-6 max-w-3xl text-lg leading-relaxed [overflow-wrap:anywhere]">
          &ldquo;{analysis.funniest.reason}&rdquo;
        </blockquote>

        <h3 className="mt-8 text-sm font-semibold text-accent">
          okay but what&rsquo;s the actual dynamic
        </h3>
        <p className="mt-2 max-w-3xl leading-relaxed [overflow-wrap:anywhere]">
          {analysis.conversationDynamic}
        </p>

        <div className="mt-8 space-y-1 text-xs text-muted">
          <p>*science may be doing some heavy lifting here</p>
          {analysis.sample && (
            <p>
              {analysis.sample.sampledMessages === analysis.sample.readableMessages
                ? `based on all ${analysis.sample.readableMessages.toLocaleString()} text messages plus the stats.`
                : `based on ${analysis.sample.sampledMessages.toLocaleString()} of ${analysis.sample.readableMessages.toLocaleString()} text messages, in ${analysis.sample.excerpts} excerpts from across the chat, plus the stats. it didn’t read everything.`}
            </p>
          )}
        </div>
      </div>

      {/* PERSONALITIES */}
      <h3 className="mt-12 font-display text-xl font-semibold tracking-tight">
        texting personalities
      </h3>
      <p className="mt-1 text-sm text-muted">
        {participants.length > 2
          ? "somehow a language model has opinions about all of you now."
          : "somehow a language model has opinions about both of you now."}
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {participants.map(([name, participant]) => (
          <article key={name} className="card min-w-0 p-5 sm:p-6">
            <h4 className="font-display text-xl font-semibold tracking-tight [overflow-wrap:anywhere]">
              {name}
            </h4>
            <dl className="mt-4 space-y-4">
              <PersonalityBit label="how they text" value={participant.textingStyle} />
              <PersonalityBit label="comedic specialization" value={participant.humorStyle} />
              <PersonalityBit label="role in the chat" value={participant.summary} />
            </dl>
          </article>
        ))}
      </div>

      {/* LORE */}
      <h3 className="mt-12 font-display text-xl font-semibold tracking-tight">
        things that refuse to die
      </h3>
      <p className="mt-1 text-sm text-muted">
        topics and bits that apparently deserve recurring roles in your
        friendship.
      </p>

      <ul aria-label="Recurring topics" className="mt-4 flex flex-wrap gap-2">
        {analysis.recurringTopics.map((topic, index) => (
          <li
            key={`${topic}-${index}`}
            className="max-w-full rounded-full border border-line bg-panel px-3.5 py-1.5 text-sm [overflow-wrap:anywhere]"
          >
            {topic}
          </li>
        ))}
      </ul>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <LoreList title="recurring bits" items={analysis.insideJokesOrPatterns} />
        <LoreList title="things the machine noticed" items={analysis.interestingObservations} />
      </div>
    </section>
  );
}

function PersonalityBit({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="mt-0.5 leading-relaxed [overflow-wrap:anywhere]">{value}</dd>
    </div>
  );
}

function LoreList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="card min-w-0 p-5 sm:p-6">
      <h4 className="font-semibold">{title}</h4>
      <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-muted marker:text-accent">
        {items.map((item, index) => (
          <li key={`${item}-${index}`} className="[overflow-wrap:anywhere]">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
