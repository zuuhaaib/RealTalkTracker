import type { Metadata } from "next";

import AuthForm from "../../components/AuthForm";
import { SiteFooter, SiteHeader, SkipLink, stagger } from "../../components/ui";

export const metadata: Metadata = {
  title: "Create an account | TalkTracker",
  description: "Create a free TalkTracker account to analyze a chat.",
};

export default function RegisterPage() {
  return (
    <>
      <SkipLink />
      <SiteHeader current="register" />

      <main id="main-content" className="mx-auto w-full max-w-md px-5 pt-12 sm:pt-20">
        <h1 className="say text-[clamp(2.75rem,1.6rem+4vw,4.5rem)]">new phone, who dis.</h1>
        <p data-reveal style={stagger(1)} className="note mt-4 mb-10 text-xl">
          a free account, so your results know whose they are.
        </p>
        <div data-reveal style={stagger(2)}>
          <AuthForm mode="register" />
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
