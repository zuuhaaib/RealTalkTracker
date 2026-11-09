import type { Metadata } from "next";

import AuthForm from "../../components/AuthForm";
import { SiteFooter, SiteHeader, SkipLink, stagger } from "../../components/ui";

export const metadata: Metadata = {
  title: "Log in | TalkTracker",
  description: "Log in to TalkTracker to analyze a chat.",
};

export default function LoginPage() {
  return (
    <>
      <SkipLink />
      <SiteHeader current="login" />

      <main id="main-content" className="mx-auto w-full max-w-md px-5 pt-12 sm:pt-20">
        <h1 className="say text-[clamp(2.75rem,1.6rem+4vw,4.5rem)]">hey. you again.</h1>
        <p data-reveal style={stagger(1)} className="note mt-4 mb-10 text-xl">
          log in to settle another one.
        </p>
        <div data-reveal style={stagger(2)}>
          <AuthForm mode="login" />
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
