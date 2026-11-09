"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";

// Long text, cut to a few lines with a button to read the rest. The
// button only appears when the text is actually longer than that.
export default function Expandable({
  children,
  lines = 4,
  className = "",
  moreLabel = "read the rest",
}: {
  children: ReactNode;
  lines?: number;
  className?: string;
  moreLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    const element = textRef.current;
    if (!element || open) return;

    // Re-check whenever the width changes (phones rotate, windows resize).
    const observer = new ResizeObserver(() => {
      setOverflows(element.scrollHeight > element.clientHeight + 2);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [open]);

  return (
    <div className={className}>
      <div
        id={id}
        ref={textRef}
        style={open ? undefined : { WebkitLineClamp: lines, display: "-webkit-box", WebkitBoxOrient: "vertical", overflow: "hidden" }}
      >
        {children}
      </div>
      {(overflows || open) && (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((value) => !value)}
          className="text-link mt-2 text-base"
        >
          {open ? "less" : moreLabel}
        </button>
      )}
    </div>
  );
}
