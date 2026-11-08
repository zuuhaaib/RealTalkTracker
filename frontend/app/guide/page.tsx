import type { Metadata } from "next";
import Link from "next/link";

import ExportGuide from "../../components/ExportGuide";
import {
  SiteFooter,
  SiteHeader,
  SkipLink,
  container,
} from "../../components/ui";

export const metadata: Metadata = {
  title: "Export your chat | TalkTracker",
  description:
    "Prepare your WhatsApp or copied Instagram conversation for TalkTracker.",
};

export default function GuidePage() {
  return (
    <>
      <SkipLink />
      <SiteHeader current="guide" />

      <main id="main-content" className={`${container} pt-10 sm:pt-16`}>
        <header className="max-w-2xl">
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            bring the chat. leave the screenshots.
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            Pick your platform, follow the steps, then come back with the text
            file. A .txt file up to 10 MiB. You won’t need your WhatsApp or Instagram password.
          </p>
        </header>

        <div className="mt-10">
          <ExportGuide />
        </div>

        <section aria-labelledby="notes-title" className="mt-14 max-w-3xl">
          <h2
            id="notes-title"
            className="font-display text-xl font-semibold tracking-tight"
          >
            good to know
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-muted marker:text-accent">
            <li>
              Only upload conversations you have permission to share. AI
              analysis sends participant names, statistics, and selected
              message excerpts to OpenAI.
            </li>
            <li>
              The parser understands English-language exports. System messages
              and media placeholders in other languages may sneak into the
              word counts.
            </li>
            <li>
              Group chats work, but nobody can tell from an export who was
              replying to whom, so reply stats become “gap before jumping in”.
            </li>
            <li>
              Stuck?{" "}
              <a
                href="https://faq.whatsapp.com/1180414079177245/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-link"
              >
                WhatsApp&rsquo;s official export guide
              </a>{" "}
              has more detail.
            </li>
          </ul>
        </section>

        <section
          aria-labelledby="ready-title"
          className="card mt-14 flex flex-col items-start gap-5 p-8 sm:flex-row sm:items-center sm:justify-between"
        >
          <h2
            id="ready-title"
            className="font-display text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            file acquired? let’s overthink it.
          </h2>
          <Link href="/analyze" className="btn-primary shrink-0">
            upload your chat
          </Link>
        </section>
      </main>

      <SiteFooter line="statistics, inside jokes, and questionable judgment." />
    </>
  );
}
