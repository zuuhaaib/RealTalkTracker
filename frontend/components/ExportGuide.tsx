"use client";

import { useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";

const code = "rounded bg-bg px-1.5 py-0.5 text-[0.9em] text-accent";

type Platform = {
  id: string;
  label: string;
  intro?: ReactNode;
  steps: ReactNode[];
  after?: ReactNode;
};

const platforms: Platform[] = [
  {
    id: "whatsapp-iphone",
    label: "WhatsApp · iPhone",
    steps: [
      "Open the conversation in WhatsApp on your phone.",
      <>
        Tap the contact or group name at the top, then find{" "}
        <strong className="font-semibold text-ink">Export Chat</strong>.
      </>,
      <>
        Choose <strong className="font-semibold text-ink">Without Media</strong>.
        we&rsquo;re reading the lore, not watching the videos.
      </>,
      "Save the export to Files, or transfer it to the device where you’re using TalkTracker.",
      <>
        If you received a ZIP, extract it first. Upload the{" "}
        <code className={code}>.txt</code> file inside, often named{" "}
        <code className={code}>_chat.txt</code>.
      </>,
    ],
  },
  {
    id: "whatsapp-android",
    label: "WhatsApp · Android",
    steps: [
      "Open the conversation in WhatsApp on your phone.",
      <>
        Open the three-dot menu, then choose{" "}
        <strong className="font-semibold text-ink">More → Export chat</strong>.
      </>,
      <>
        Choose <strong className="font-semibold text-ink">Without media</strong>.
      </>,
      "Save or share the export to the device where you’re using TalkTracker.",
      <>
        Upload the <code className={code}>.txt</code> file. If it came inside a
        ZIP, extract it first.
      </>,
    ],
  },
  {
    id: "instagram",
    label: "Instagram",
    intro: (
      <>
        A few extra steps, unfortunately. Instagram support currently works
        with text copied from a downloaded conversation. Raw JSON, HTML, and
        ZIP files aren&rsquo;t accepted directly.
      </>
    ),
    steps: [
      <>
        Use Instagram&rsquo;s information export tool to request your messages.
        Follow the{" "}
        <a
          href="https://help.instagram.com/181231772500920"
          target="_blank"
          rel="noopener noreferrer"
          className="text-link"
        >
          official export instructions
        </a>
        . Choose HTML if you want to open the downloaded conversation in a
        browser.
      </>,
      "Once the download is ready, extract it and open the conversation you want to analyze.",
      "Copy the conversation content into a plain-text editor such as Notepad. Preserve the sender names, messages, timestamps, and line breaks.",
      "Check that the copied text follows the layout below. The very first line must be a sender’s name. Delete any page title, navigation, or headings above it, or they’ll show up as a mystery extra participant.",
      <>
        Save it as a UTF-8 <code className={code}>.txt</code> file and upload
        it.
      </>,
    ],
    after: (
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <figure>
          <figcaption className="mb-2 text-sm text-muted">
            expected layout · fictional example
          </figcaption>
          <pre className="overflow-x-auto rounded-xl border border-line bg-bg p-4 text-sm leading-6">
            {`Alex
hello
Dec 15, 2025 3:07 pm
Sam
deeply insightful
Dec 15, 2025 3:06 pm`}
          </pre>
        </figure>
        <p className="self-end text-sm leading-relaxed text-muted">
          Export layouts can vary. If yours doesn&rsquo;t copy into this
          structure, it may not work with the current parser. Renaming a .json
          or .html file to .txt won&rsquo;t convert it.
        </p>
      </div>
    ),
  },
];

// Export steps, one platform at a time. Follows the ARIA tabs pattern:
// arrow keys, Home and End move between platforms.
export default function ExportGuide() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const last = platforms.length - 1;
    let next: number | null = null;

    if (event.key === "ArrowRight") next = active === last ? 0 : active + 1;
    if (event.key === "ArrowLeft") next = active === 0 ? last : active - 1;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = last;

    if (next === null) return;

    event.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  }

  const platform = platforms[active];

  return (
    <section id="export-guide" aria-labelledby="export-guide-title">
      <h2 id="export-guide-title" className="sr-only">
        Export steps by platform
      </h2>

      <div
        role="tablist"
        aria-label="Platform"
        className="flex flex-wrap gap-2"
      >
        {platforms.map((item, index) => {
          const selected = index === active;

          return (
            <button
              key={item.id}
              ref={(element) => {
                tabs.current[index] = element;
              }}
              id={`tab-${item.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(index)}
              onKeyDown={onKeyDown}
              className={`min-h-11 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                selected
                  ? "bg-accent text-on-accent"
                  : "border border-line text-muted hover:text-ink"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div
        id={`panel-${platform.id}`}
        role="tabpanel"
        aria-labelledby={`tab-${platform.id}`}
        tabIndex={0}
        className="card mt-5 p-6 sm:p-8"
      >
        {platform.intro && (
          <p className="mb-6 max-w-2xl leading-relaxed text-muted">
            {platform.intro}
          </p>
        )}

        <ol className="space-y-5">
          {platform.steps.map((step, index) => (
            <li key={index} className="flex gap-4">
              <span
                aria-hidden="true"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-panel-2 text-sm font-semibold text-accent"
              >
                {index + 1}
              </span>
              <p className="max-w-2xl pt-0.5 leading-relaxed">{step}</p>
            </li>
          ))}
        </ol>

        {platform.after}
      </div>
    </section>
  );
}
