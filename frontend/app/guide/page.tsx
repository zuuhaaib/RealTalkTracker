import type { Metadata } from "next";
import Link from "next/link";

import ExportGuide from "../../components/ExportGuide";
import { SiteFooter, SiteHeader, SkipLink, column, stagger } from "../../components/ui";

export const metadata: Metadata = {
  title: "Export your chat | TalkTracker",
  description: "Prepare your WhatsApp or copied Instagram conversation for TalkTracker.",
};

const notes = [
  "only upload chats you have permission to share. names, stats and some messages go to OpenAI for the ai’s take.",
  "the parser reads English-language exports. system messages in other languages may sneak into the word counts.",
  "group chats work, but reply times become “gap before jumping in”, since nobody can tell who was answering whom.",
];

export default function GuidePage() {
  return (
    <>
      <SkipLink />
      <SiteHeader current="guide" />

      <main id="main-content" className={`${column} pt-12 sm:pt-20`}>
        <h1 className="say text-[clamp(3rem,1.6rem+5vw,5.5rem)]">
          send it as <span className="struck">screenshots</span> text.
        </h1>
        <p data-reveal style={stagger(1)} className="mt-5 max-w-[46ch] text-xl text-muted">
          pick your phone, follow the steps, come back with a .txt file under 10 MiB. no
          passwords involved.
        </p>

        <div className="mt-12">
          <ExportGuide />
        </div>

        <section aria-labelledby="notes-title" className="mt-24">
          <h2 id="notes-title" data-reveal className="say text-[clamp(2rem,1.3rem+3vw,3.5rem)]">
            worth knowing.
          </h2>
          <ul className="mt-6 space-y-4 text-xl">
            {notes.map((note, index) => (
              <li key={note} data-reveal style={stagger(index)}>
                <span aria-hidden="true" className="note">
                  →{" "}
                </span>
                {note}
              </li>
            ))}
            <li data-reveal style={stagger(3)}>
              <span aria-hidden="true" className="note">
                →{" "}
              </span>
              stuck?{" "}
              <a
                href="https://faq.whatsapp.com/1180414079177245/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-link"
              >
                WhatsApp&rsquo;s own export guide
              </a>{" "}
              has more.
            </li>
          </ul>
        </section>

        <section aria-labelledby="ready-title" className="mt-24">
          <h2 id="ready-title" data-reveal className="say text-[clamp(2.25rem,1.4rem+3.6vw,4rem)]">
            got the file?
          </h2>
          <Link href="/analyze" data-reveal style={stagger(1)} className="send send-accent mt-6 text-lg">
            send it
          </Link>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
