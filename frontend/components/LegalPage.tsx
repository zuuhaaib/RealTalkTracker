import type { ReactNode } from "react";

import { SiteFooter, SiteHeader, SkipLink, column, stagger } from "./ui";

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

      <main id="main-content" className={`${column} pt-12 sm:pt-20`}>
        <article>
          <header>
            <h1 className="say text-[clamp(3rem,1.6rem+5vw,5.5rem)]">{title}</h1>
            <p data-reveal style={stagger(1)} className="mt-5 text-xl text-muted">
              {intro}
            </p>
            <p data-reveal style={stagger(2)} className="mt-3 text-base text-muted">
              last updated {LAST_UPDATED}
            </p>
          </header>

          <div className="mt-14 space-y-12">{children}</div>
        </article>
      </main>

      <SiteFooter />
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
    <section data-reveal>
      <h2 className="say text-[clamp(1.6rem,1.3rem+1vw,2.1rem)]">{title}</h2>
      <div className="mt-2 max-w-[62ch] space-y-3 text-lg leading-relaxed [&_li]:pl-1 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:marker:text-accent-text">
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
