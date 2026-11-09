import Link from "next/link";

import { SiteFooter, SiteHeader, SkipLink, column, stagger } from "../components/ui";

export default function NotFound() {
  return (
    <>
      <SkipLink />
      <SiteHeader current="lost" />

      <main id="main-content" className={`${column} pt-16 sm:pt-28`}>
        <h1 className="say text-[clamp(3rem,1.6rem+6vw,6.5rem)]">this page left you on read.</h1>
        <p data-reveal style={stagger(1)} className="mt-4 text-lg text-muted">
          seen just now
        </p>
        <p data-reveal style={stagger(2)} className="mt-8 max-w-[40ch] text-xl">
          it saw your message and chose silence. honestly, rude. the rest of the site still talks
          to you.
        </p>
        <div data-reveal style={stagger(3)} className="mt-8 flex flex-wrap gap-4">
          <Link href="/" className="send send-accent text-lg">
            take me home
          </Link>
          <Link href="/analyze" className="send text-lg">
            upload a chat
          </Link>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
