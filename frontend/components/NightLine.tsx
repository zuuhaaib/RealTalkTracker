"use client";

import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  const timer = window.setInterval(onChange, 30_000);
  return () => window.clearInterval(timer);
}

// The visitor's clock, read in the browser only (the server can't know it).
function readLateNight() {
  const now = new Date();
  if (now.getHours() >= 5) return "";
  return now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase();
}

// Between midnight and 5 am, a quiet line under the hero.
export default function NightLine() {
  const time = useSyncExternalStore(subscribe, readLateNight, () => "");
  if (!time) return null;

  return (
    <p className="note mt-4 text-lg motion-safe:animate-[pop-in_400ms_var(--ease-out)]">
      also, it&rsquo;s {time}. who are you texting.
    </p>
  );
}
