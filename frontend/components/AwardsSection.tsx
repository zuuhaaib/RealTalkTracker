import type { Awards } from "../types/analysis";
import { SectionHeading, stagger } from "./ui";

// The awards, as a grid of tiles: what it's for, who won, one dry line.
export default function AwardsSection({
  awards,
  isGroup,
  idPrefix = "",
}: {
  awards: Awards;
  isGroup: boolean;
  idPrefix?: string;
}) {
  const list = [
    { title: "biggest yapper", winner: awards.biggestYapper, caption: "bro had things to say." },
    {
      title: isGroup ? "quickest to jump in" : "fastest replier",
      winner: awards.fastestResponder,
      caption: isGroup ? "who they were answering is anyone’s guess." : "phone surgically attached.",
    },
    { title: "conversation starter", winner: awards.conversationStarter, caption: "keeping it alive, one “hey” at a time." },
    { title: "double texter", winner: awards.doubleTexter, caption: "one message was never enough." },
    { title: "most words", winner: awards.mostWords, caption: "published author, apparently." },
    { title: "essay sender", winner: awards.longestMessages, caption: "paragraph enjoyer." },
  ];

  return (
    <section aria-labelledby={`${idPrefix}awards-title`}>
      <SectionHeading id={`${idPrefix}awards-title`} title="the awards." intro="prestigious. rigorous. ties are shared." />

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((award, index) => (
          <li
            key={award.title}
            data-reveal
            style={stagger(index % 3)}
            className="min-w-0 rounded-3xl bg-bg-2 p-6 transition-transform duration-300 hover:-rotate-1"
          >
            <h3 className="text-base text-muted">{award.title}</h3>
            <p className="say mt-2 text-[clamp(1.75rem,1.3rem+1.4vw,2.5rem)] [overflow-wrap:anywhere]">
              {award.winner ?? <span className="text-muted">nobody</span>}
            </p>
            <p className="note mt-2 text-base">{award.winner ? award.caption : "nobody qualified."}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
