import type { Metadata } from "next";

import AuthForm from "../../components/AuthForm";
import { SiteFooter, SiteHeader, SkipLink, container } from "../../components/ui";

export const metadata: Metadata = {
  title: "Log in | TalkTracker",
  description: "Log in to TalkTracker to analyze a chat.",
};

export default function LoginPage() {
  return (
    <>
      <SkipLink />
      <SiteHeader current="login" />

      <main id="main-content" className={`${container} pt-10 sm:pt-16`}>
        <div className="mx-auto max-w-md">
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            welcome back.
          </h1>
          <p className="mt-3 mb-8 text-lg leading-relaxed text-muted">
            log in to settle another argument.
          </p>

          <AuthForm mode="login" />
        </div>
      </main>

      <SiteFooter line="some friendships deserve a footnote." />
    </>
  );
}
