"use client";

import { useEffect, useState } from "react";

export type Jump = { id: string; label: string };

// A sticky row of links to each part of the results, with the part you're
// reading highlighted.
export default function JumpNav({ jumps }: { jumps: Jump[] }) {
  const [current, setCurrent] = useState(jumps[0]?.id ?? "");

  useEffect(() => {
    const targets = jumps
      .map((jump) => document.getElementById(jump.id))
      .filter((element): element is HTMLElement => element !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length) setCurrent(visible[0].target.id);
      },
      // A band across the upper part of the screen decides "current".
      { rootMargin: "-20% 0px -65% 0px" },
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [jumps]);

  return (
    <nav aria-label="Results" className="sticky top-0 z-20 -mx-5 bg-bg/95 px-5 py-3 sm:-mx-8 sm:px-8">
      <ul className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
        {jumps.map((jump) => (
          <li key={jump.id} className="shrink-0">
            <a
              href={`#${jump.id}`}
              aria-current={current === jump.id ? "true" : undefined}
              className={`inline-flex min-h-10 items-center rounded-full px-4 text-base font-semibold transition-colors ${
                current === jump.id ? "bg-ink text-bg" : "bg-bg-2 text-ink hover:bg-accent"
              }`}
            >
              {jump.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
