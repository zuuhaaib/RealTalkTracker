import type { ReactNode } from "react";

import { SiteFooter, SiteHeader, SkipLink, container } from "./ui";

// Shared details for the privacy policy and terms of service.
export const CONTACT_EMAIL = "zuuhaaib@gmail.com";
export const LAST_UPDATED = "November 8, 2026";

export function LegalPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <SkipLink />
      <SiteHeader current="legal" />

      <main id="main-content" className={`${container} pt-10 sm:pt-16`}>
        <article className="mx-auto max-w-2xl">
          <header>
            <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              {title}
            </h1>
            <p className="mt-3 text-sm text-muted">Last updated {LAST_UPDATED}</p>
            <p className="mt-6 text-lg leading-relaxed text-muted">{intro}</p>
          </header>

          <div className="mt-10 space-y-10">{children}</div>
        </article>
      </main>

      <SiteFooter line="some friendships deserve a footnote." />
    </>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="font-display text-2xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-3 space-y-3 leading-relaxed [&_li]:pl-1 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:marker:text-accent">
        {children}
      </div>
    </section>
  );
}

export function ContactLink() {
  return (
    <a href={`mailto:${CONTACT_EMAIL}`} className="text-link">
      {CONTACT_EMAIL}
    </a>
  );
}
