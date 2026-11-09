"use client";

import { useEffect, useState } from "react";

// A line that types itself like a draft: it writes `draft`, thinks better
// of the last word, backspaces it and finishes with `final`. The finished
// sentence is always in the accessible text, and is what shows without
// script or under reduced motion.
export default function TypedLine({
  draft,
  final,
  className = "",
}: {
  draft: string;
  final: string;
  className?: string;
}) {
  // null until the browser takes over: the server renders the final line.
  const [shown, setShown] = useState<string | null>(null);

  useEffect(() => {
    // Reduced motion: show the finished line straight away.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const timer = window.setTimeout(() => setShown(final), 0);
      return () => window.clearTimeout(timer);
    }

    // Where the draft and the final line start to differ.
    let common = 0;
    while (common < draft.length && draft[common] === final[common]) common += 1;

    const steps: { text: string; wait: number }[] = [];
    for (let i = 1; i <= draft.length; i += 1) steps.push({ text: draft.slice(0, i), wait: 55 + Math.random() * 60 });
    steps[steps.length - 1].wait = 700; // the pause before regretting it
    for (let i = draft.length - 1; i >= common; i -= 1) steps.push({ text: draft.slice(0, i), wait: 40 });
    steps[steps.length - 1].wait = 260;
    for (let i = common + 1; i <= final.length; i += 1) steps.push({ text: final.slice(0, i), wait: 60 + Math.random() * 50 });

    let index = 0;
    let timer = 0;

    const next = () => {
      setShown(steps[index].text);
      const wait = steps[index].wait;
      index += 1;
      if (index < steps.length) timer = window.setTimeout(next, wait);
    };

    timer = window.setTimeout(next, 350);
    return () => window.clearTimeout(timer);
  }, [draft, final]);

  return (
    <span className={className}>
      <span className="sr-only">{final}</span>
      {/* Hidden until typing starts, so the full line doesn't flash first. */}
      <span aria-hidden="true" className={shown === null ? "typed-pending" : undefined}>
        {shown ?? final}
        <span className="caret" />
      </span>
    </span>
  );
}
