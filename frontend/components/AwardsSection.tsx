import type { Awards } from "../types/analysis";
import { SectionHeading } from "./ui";

export default function AwardsSection({
  awards,
  isGroup,
}: {
  awards: Awards;
  isGroup: boolean;
}) {
  const list = [
    {
      title: "biggest yapper",
      winner: awards.biggestYapper,
      caption: "bro had things to say",
      emptyCaption: "nobody sent a message, somehow",
    },
    {
      title: isGroup ? "quickest to jump in" : "fastest responder",
      winner: awards.fastestResponder,
      caption: isGroup
        ? "shortest median gap before speaking. who they were answering is anyone’s guess"
        : "phone apparently surgically attached",
      emptyCaption:
        "no sender changes within six hours, so there was nothing to time",
    },
    {
      title: "conversation starter",
      winner: awards.conversationStarter,
      caption: "keeping the friendship alive one text at a time",
      emptyCaption: "no conversations to start",
    },
    {
      title: "double text champion",
      winner: awards.doubleTexter,
      caption: "most extra messages in a row. one message simply wasn’t enough",
      emptyCaption: "nobody sent two messages in a row",
    },
    {
      title: "most words",
      winner: awards.mostWords,
      caption: "published author apparently",
      emptyCaption: "no readable words to count",
    },
    {
      title: "certified essay sender",
      winner: awards.longestMessages,
      caption: "paragraph enjoyer",
      emptyCaption: "no readable words to count",
    },
  ];

  return (
    <section aria-labelledby="awards-title">
      <SectionHeading
        id="awards-title"
        title="chat awards"
        intro="prestigious. scientifically rigorous. definitely going on linkedin."
      />

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((award) => (
          <li key={award.title} className="card min-w-0 p-5">
            <h3 className="text-sm text-muted">{award.title}</h3>
            <p
              className={`mt-1 font-display text-2xl font-semibold tracking-tight [overflow-wrap:anywhere] ${
                award.winner === null ? "text-muted" : "text-accent"
              }`}
            >
              {award.winner ?? "no winner"}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {award.winner === null ? award.emptyCaption : award.caption}
            </p>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-sm text-muted">
        awards use the same definitions as the stats above. ties are shared.
      </p>
    </section>
  );
}
