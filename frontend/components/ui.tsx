import Link from "next/link";
import type { ReactNode } from "react";

import AuthNav from "./AuthNav";

// The page frame: same width and side margins everywhere.
export const container = "mx-auto w-full max-w-6xl px-5 sm:px-8";

type Page = "home" | "analyze" | "guide" | "login" | "register" | "legal";

// The logo: a speech bubble holding three rising bars. Same drawing as
// branding/talktracker-mark.svg and the favicon.
export function LogoMark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="12 10 96 96" className={`shrink-0 ${className}`}>
      <path
        fill="var(--tangerine)"
        d="M38 20H82A22 22 0 0 1 104 42V74A22 22 0 0 1 82 96H20A4 4 0 0 1 16 92V42A22 22 0 0 1 38 20Z"
      />
      <rect x="34" y="62" width="12" height="18" rx="3" fill="var(--ink)" />
      <rect x="54" y="52" width="12" height="28" rx="3" fill="var(--ink)" />
      <rect x="74" y="40" width="12" height="40" rx="3" fill="var(--ink)" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <span className="inline-flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
      <LogoMark />
      talktracker
    </span>
  );
}

export function SiteHeader({ current }: { current: Page }) {
  return (
    <header className={`${container} flex items-center justify-between py-5`}>
      <Link
        href="/"
        aria-label="TalkTracker home"
        aria-current={current === "home" ? "page" : undefined}
        className="rounded-md"
      >
        <Wordmark />
      </Link>

      <nav aria-label="Main navigation">
        <ul className="flex items-center gap-5 text-sm sm:gap-6">
          {/* On phones the account buttons take priority; every page links
              to the guide from its own content. */}
          <li className={current === "analyze" ? "" : "hidden sm:block"}>
            <Link
              href="/guide"
              aria-current={current === "guide" ? "page" : undefined}
              className="rounded-sm text-muted transition-colors hover:text-ink aria-[current=page]:text-ink"
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

export function SiteFooter({ line }: { line: string }) {
  return (
    <footer className={`${container} mt-auto pt-24`}>
      <div className="flex flex-col gap-3 border-t border-line py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          built by <span className="font-medium text-ink">zuhaib khan</span>
        </p>
        <nav aria-label="Legal" className="flex gap-5">
          <Link href="/privacy" className="rounded-sm transition-colors hover:text-ink">
            privacy
          </Link>
          <Link href="/terms" className="rounded-sm transition-colors hover:text-ink">
            terms
          </Link>
        </nav>
        <p>{line}</p>
      </div>
    </footer>
  );
}

export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="btn-primary sr-only fixed left-4 top-4 z-50 focus:not-sr-only"
    >
      skip to content
    </a>
  );
}

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
    <div className="mb-8 max-w-2xl">
      <h2
        id={id}
        className="font-display text-3xl font-semibold tracking-tight [overflow-wrap:anywhere] sm:text-4xl"
      >
        {title}
      </h2>
      {intro && <p className="mt-2 text-muted">{intro}</p>}
    </div>
  );
}
