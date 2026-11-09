"use client";

import { useRef, useState } from "react";

import type { AIAnalysis } from "../types/analysis";
import { SectionHeading } from "./ui";

// The closing payoff: a tiny work of fiction starring the people in the chat.
export default function StorySection({
  story,
  idPrefix = "",
}: {
  story: NonNullable<AIAnalysis["story"]>;
  idPrefix?: string;
}) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<number | undefined>(undefined);

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${story.title}\n\n${story.text}`);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }

    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStatus("idle"), 2500);
  }

  return (
    <section aria-labelledby={`${idPrefix}story-title`}>
      <SectionHeading id={`${idPrefix}story-title`} title="and now, a story." intro="written by the robot. starring you, unfortunately." />

      <article data-reveal className="rounded-[2rem] bg-ink p-7 text-bg sm:p-12">
        <h3 className="say max-w-[20ch] text-[clamp(2.25rem,1.5rem+3vw,4rem)] [overflow-wrap:anywhere]">
          {story.title}
        </h3>
        <p className="mt-6 max-w-[62ch] text-xl leading-relaxed whitespace-pre-line [overflow-wrap:anywhere]">
          {story.text}
          <span aria-hidden="true" className="caret" />
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
          <button type="button" onClick={copy} className="send send-accent text-lg">
            {status === "copied" ? "copied." : "copy story"}
          </button>
          <p aria-live="polite" className="text-base text-bg/70">
            {status === "failed" ? "your browser said no. select it by hand." : "fiction. none of this happened. probably."}
          </p>
        </div>
      </article>
    </section>
  );
}
