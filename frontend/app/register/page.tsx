import type { Metadata } from "next";

import AuthForm from "../../components/AuthForm";
import { SiteFooter, SiteHeader, SkipLink, container } from "../../components/ui";

export const metadata: Metadata = {
  title: "Create an account | TalkTracker",
  description: "Create a free TalkTracker account to analyze your chats.",
};

export default function RegisterPage() {
  return (
    <>
      <SkipLink />
      <SiteHeader current="register" />

      <main id="main-content" className={`${container} pt-10 sm:pt-16`}>
        <div className="mx-auto max-w-md">
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            make it official.
          </h1>
          <p className="mt-3 mb-8 text-lg leading-relaxed text-muted">
            a free account, then the receipts. takes about a minute.
          </p>

          <AuthForm mode="register" />
        </div>
      </main>

      <SiteFooter line="some friendships deserve a footnote." />
    </>
  );
}
