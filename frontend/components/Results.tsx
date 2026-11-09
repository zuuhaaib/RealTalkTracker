"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

import type { AnalyzeResponse } from "../types/analysis";
import { byMessages, summarize } from "../lib/edition";
import AIAnalysisSection from "./AIAnalysisSection";
import ActivitySection from "./ActivitySection";
import AwardsSection from "./AwardsSection";
import DonateLink from "./DonateLink";
import JumpNav from "./JumpNav";
import ParticipantStatsSection from "./ParticipantStats";
import ShareCards from "./ShareCards";
import StorySection from "./StorySection";
import { container } from "./ui";

// A chat's results, used straight after an upload and when reopening a
// saved one. `bar` sits above them, `action` beside the verdict, and
// `ending` after everything. Next keeps a page you've left in memory, hidden,
// so each page passes its own `idPrefix` to keep section ids unique.
export default function Results({
  data,
  bar,
  action,
  ending,
  idPrefix = "",
}: {
  data: AnalyzeResponse;
  bar: ReactNode;
  action?: ReactNode;
  ending?: ReactNode;
  idPrefix?: string;
}) {
  const heading = useRef<HTMLHeadingElement>(null);

  // Move focus to the results when they appear, so keyboard and screen
  // reader users land on them instead of a button that has gone away.
  useEffect(() => {
    heading.current?.focus();
  }, []);

  const isGroup = Object.keys(data.statistics.participants).length > 2;
  const top = byMessages(data)[0];
  const facts = summarize(data);
  const story = "error" in data.aiAnalysis ? undefined : data.aiAnalysis.story;

  return (
    <div className={`${container} pt-6`}>
      {bar}

      {/* THE VERDICT AND THE TL;DR */}
      <section aria-labelledby={`${idPrefix}results-title`} className="pt-14 pb-10 sm:pt-20">
        <h1
          id={`${idPrefix}results-title`}
          ref={heading}
          tabIndex={-1}
          className="say max-w-[16ch] text-[clamp(2.75rem,1.5rem+5vw,5.5rem)] [overflow-wrap:anywhere] focus:outline-none motion-safe:animate-[pop-in_500ms_var(--ease-out)]"
        >
          {top[0]} is carrying this {isGroup ? "group chat" : "chat"}.
        </h1>
        <p className="note mt-4 text-xl">screenshot this, send it, walk away.</p>
        {action}

        <h2 id={`${idPrefix}tldr`} className="sr-only scroll-mt-24">
          tl;dr
        </h2>
        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {facts.map((fact, index) => (
            <li
              key={fact.id}
              style={{ animationDelay: `${200 + index * 90}ms` }}
              className={`min-w-0 rounded-3xl p-4 motion-safe:animate-[pop-in_500ms_var(--ease-out)_both] sm:p-6 ${
                index === 0 ? "bg-accent" : "bg-bg-2"
              }`}
            >
              <p className={`text-base ${index === 0 ? "text-ink" : "text-muted"}`}>{fact.label}</p>
              <p className="say mt-1 text-[clamp(1.5rem,1.2rem+1.4vw,2.5rem)] [overflow-wrap:anywhere] sm:mt-2">
                {fact.name}
              </p>
              <p className="mt-1 text-base">{fact.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      <JumpNav
        jumps={[
          { id: `${idPrefix}tldr`, label: "tl;dr" },
          { id: `${idPrefix}numbers-title`, label: "the numbers" },
          { id: `${idPrefix}awards-title`, label: "awards" },
          { id: `${idPrefix}activity-title`, label: "when" },
          { id: `${idPrefix}ai-title`, label: "the ai’s take" },
          ...(story ? [{ id: `${idPrefix}story-title`, label: "the story" }] : []),
          { id: `${idPrefix}share-title`, label: "share" },
        ]}
      />

      <div className="space-y-24 pt-12 sm:space-y-32 sm:pt-16">
        <ParticipantStatsSection statistics={data.statistics} behaviorByName={data.behavior} idPrefix={idPrefix} />
        <AwardsSection awards={data.awards} isGroup={isGroup} idPrefix={idPrefix} />
        <ActivitySection activity={data.activity} idPrefix={idPrefix} />
        <AIAnalysisSection analysis={data.aiAnalysis} idPrefix={idPrefix} />
        {story && <StorySection story={story} idPrefix={idPrefix} />}
        <ShareCards data={data} idPrefix={idPrefix} />

        <section aria-labelledby={`${idPrefix}donate-title`}>
          <h2
            id={`${idPrefix}donate-title`}
            data-reveal
            className="say max-w-[18ch] text-[clamp(2.25rem,1.4rem+3.6vw,4rem)]"
          >
            i&rsquo;m broke. api credits aren&rsquo;t free. pls.
          </h2>
          <div data-reveal className="mt-6">
            <DonateLink />
          </div>
        </section>
      </div>

      {ending}
    </div>
  );
}
