"use client";

import { useEffect, useRef, useState } from "react";

import BadHorse from "./BadHorse";

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

const AWAY_TITLE = "u up?";
const BACK_TITLE = "oh. you’re back.";

type Phase = "idle" | "seen" | "typing" | "reply";

function typingInField(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

function clockNow() {
  return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase();
}

// The site's hidden extras. None of them get in the way of using it:
// - the Konami code: the site leaves you on read. the page goes grey,
//   "seen" appears, it starts typing, stops, and eventually replies
// - type "horse" anywhere: a horse gallops along the bottom
// - switch tabs: the title asks "u up?"
export default function EasterEggs() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [seenAt, setSeenAt] = useState("");
  const [horse, setHorse] = useState(0);
  const typed = useRef("");
  const keys = useRef<string[]>([]);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const later = (ms: number, run: () => void) => {
      timers.current.push(window.setTimeout(run, ms));
    };

    const leaveOnRead = () => {
      timers.current.forEach(window.clearTimeout);
      timers.current = [];

      const root = document.documentElement;
      root.classList.add("left-on-read");
      setSeenAt(clockNow());
      setPhase("seen");

      // seen... typing... stops typing... finally a reply.
      later(1800, () => setPhase("typing"));
      later(3600, () => setPhase("seen"));
      later(5200, () => setPhase("typing"));
      later(6400, () => {
        root.classList.remove("left-on-read");
        setPhase("reply");
      });
      later(10400, () => setPhase("idle"));
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || typingInField(event.target)) return;

      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      keys.current = [...keys.current, key].slice(-KONAMI.length);

      if (keys.current.join(",") === KONAMI.join(",")) {
        keys.current = [];
        leaveOnRead();
      }

      if (event.key.length === 1) {
        typed.current = (typed.current + event.key.toLowerCase()).slice(-5);
        if (typed.current === "horse") {
          typed.current = "";
          setHorse((count) => count + 1);
          later(6200, () => setHorse(0));
        }
      }
    };

    let savedTitle = document.title;
    const onVisibility = () => {
      if (document.hidden) {
        if (document.title !== AWAY_TITLE && document.title !== BACK_TITLE) savedTitle = document.title;
        document.title = AWAY_TITLE;
      } else if (document.title === AWAY_TITLE) {
        document.title = BACK_TITLE;
        later(2500, () => {
          if (document.title === BACK_TITLE) document.title = savedTitle;
        });
      }
    };

    window.addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", onVisibility);

    console.log(
      "%cyou opened the console.%c\nthat’s a bit much. (try ↑↑↓↓←→←→ b a on the page.)",
      "font: 700 22px system-ui;",
      "font: 14px system-ui;",
    );

    const pending = timers.current;
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVisibility);
      pending.forEach(window.clearTimeout);
      document.documentElement.classList.remove("left-on-read");
    };
  }, []);

  return (
    <>
      {/* Left on read: the status, bottom right, like under a sent message. */}
      {phase !== "idle" && (
        <div
          role="status"
          className="fixed right-5 bottom-5 z-50 text-right motion-safe:animate-[pop-in_300ms_var(--ease-out)]"
        >
          {phase === "seen" && <p className="text-lg text-muted">seen {seenAt}</p>}
          {phase === "typing" && (
            <p className="inline-block rounded-full bg-bg-2 px-4 py-2 text-2xl leading-none text-muted">
              <span className="sr-only">typing</span>
              <span aria-hidden="true" className="dots">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </span>
            </p>
          )}
          {phase === "reply" && (
            <p className="inline-block rounded-3xl rounded-br-md bg-ink px-5 py-3 text-xl text-bg">
              sorry was asleep
            </p>
          )}
        </div>
      )}

      {/* The horse. Keyed so it gallops again each time. */}
      {horse > 0 && (
        <div
          key={`horse-${horse}`}
          aria-hidden="true"
          className="pointer-events-none fixed bottom-4 left-0 z-50 w-[min(16rem,45vw)] motion-safe:animate-[gallop-across_6s_linear_forwards] motion-reduce:left-4"
        >
          <BadHorse plain className="block h-auto w-full motion-safe:animate-[horse-bob_320ms_ease-in-out_infinite_alternate]" />
        </div>
      )}
    </>
  );
}
