import Link from "next/link";
import type { ReactNode } from "react";

import { column, container } from "../lib/layout";
import { stagger } from "../lib/motion";
import AuthNav from "./AuthNav";
import { DONATE_URL } from "./DonateLink";

export { column, container, stagger };

export type Page = "home" | "analyze" | "guide" | "saved" | "login" | "register" | "legal" | "lost";

// The logo: a speech bubble holding three rising bars. Same drawing as
// branding/talktracker-mark.svg and the favicon.
export function LogoMark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="12 10 96 96" className={`shrink-0 ${className}`}>
      <path
        fill="var(--accent)"
        d="M38 20H82A22 22 0 0 1 104 42V74A22 22 0 0 1 82 96H20A4 4 0 0 1 16 92V42A22 22 0 0 1 38 20Z"
      />
      <rect x="34" y="62" width="12" height="18" rx="3" fill="var(--ink)" />
      <rect x="54" y="52" width="12" height="28" rx="3" fill="var(--ink)" />
      <rect x="74" y="40" width="12" height="40" rx="3" fill="var(--ink)" />
    </svg>
  );
}

export function SiteHeader({ current }: { current: Page }) {
  return (
    <header className={`${container} flex min-h-20 items-center justify-between gap-4`}>
      <Link
        href="/"
        aria-label="TalkTracker home"
        aria-current={current === "home" ? "page" : undefined}
        className="group inline-flex items-center gap-2 text-xl font-bold tracking-tight"
      >
        <LogoMark className="h-7 w-7 transition-transform duration-300 group-hover:-rotate-12" />
        talktracker
      </Link>

      <nav aria-label="Main navigation">
        <ul className="flex items-center gap-4 whitespace-nowrap sm:gap-6">
          <li className="hidden sm:block">
            <Link
              href="/guide"
              aria-current={current === "guide" ? "page" : undefined}
              className="font-medium underline-offset-[6px] decoration-accent decoration-[3px] hover:underline aria-[current=page]:underline"
            >
              export guide
            </Link>
          </li>
          <AuthNav current={current} />
        </ul>
      </nav>
    </header>
  );
}

// A section of the single column: one sentence as the heading, and maybe
// one line under it.
export function SectionHeading({
  id,
  title,
  intro,
}: {
  id: string;
  title: ReactNode;
  intro?: ReactNode;
}) {
  return (
    <div className="mb-8">
      <h2 id={id} data-reveal className="say scroll-mt-24 text-[clamp(2rem,1.3rem+3vw,3.5rem)] [overflow-wrap:anywhere]">
        {title}
      </h2>
      {intro && (
        <p data-reveal style={stagger(1)} className="mt-3 max-w-[48ch] text-xl text-muted">
          {intro}
        </p>
      )}
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className={`${container} mt-auto pt-24 pb-10`}>
      <div className="flex flex-col gap-3 text-base text-muted sm:flex-row sm:items-baseline sm:justify-between">
        <p>
          <span className="font-semibold text-ink">zuhaib khan</span> built this instead of replying.
        </p>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-5 gap-y-1">
            <li>
              <Link href="/privacy" className="hover:text-ink">
                privacy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-ink">
                terms
              </Link>
            </li>
            <li>
              <a href="mailto:zuuhaaib@gmail.com" className="hover:text-ink">
                say hi
              </a>
            </li>
            <li>
              <a href={DONATE_URL} target="_blank" rel="noopener noreferrer" className="hover:text-ink">
                i&rsquo;m broke
              </a>
            </li>
          </ul>
        </nav>
        <p>horse: unconfirmed.</p>
      </div>
    </footer>
  );
}

export function SkipLink() {
  return (
    <a href="#main-content" className="send sr-only fixed top-4 left-4 z-50 focus:not-sr-only">
      skip to content
    </a>
  );
}
