import Link from "next/link";

import {
  SiteFooter,
  SiteHeader,
  SkipLink,
  container,
} from "../components/ui";
import {
  demoMessages,
  formatClock,
  formatGap,
  getDemoStats,
} from "../lib/demoChat";

const stats = getDemoStats();

const dayLabels: Record<string, string> = {
  "2025-05-17": "saturday",
};

const discoveries = [
  {
    question: "“i always text first.”",
    answer: "let’s count.",
    description:
      "Message shares, conversation starts, consecutive texts, and median reply gaps. Definitions included.",
  },
  {
    question: "“we don’t talk that much.”",
    answer: "your 3 AM activity says otherwise.",
    description:
      "See when the conversation happens, from your busiest hours to the months you had the most to say.",
  },
  {
    question: "“i’m obviously the funny one.”",
    answer: "we asked for an outside opinion.",
    description:
      "AI reads selected excerpts and offers its take on your humor, recurring bits, and texting styles. It can be wrong.",
  },
];

const steps = [
  {
    title: "export the conversation",
    text: "A WhatsApp text export without media, or copied Instagram text in the supported format.",
  },
  {
    title: "sign in and upload",
    text: "Create a free account, then upload your .txt file, up to 10 MiB.",
  },
  {
    title: "see what turns up",
    text: "Participation, texting habits, activity charts, awards, and AI commentary when available.",
  },
];

export default function LandingPage() {
  return (
    <>
      <SkipLink />
      <SiteHeader current="home" />

      <main id="main-content">
        {/* HERO */}
        <section
          aria-labelledby="hero-title"
          className={`${container} grid items-center gap-12 pb-20 pt-10 sm:pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:pb-28`}
        >
          <div>
            <h1
              id="hero-title"
              className="font-display text-[2.6rem] font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-[4.25rem]"
            >
              who’s actually <span className="marker">carrying</span> the
              chat?
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              Every friendship has competing accounts of events. Upload a
              WhatsApp or Instagram chat and get the numbers: who texts more,
              replies faster, and starts the conversations.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Link href="/analyze" className="btn-primary">
                alright, settle it
              </Link>
              <Link href="/guide" className="text-link">
                how do i get my chat file?
              </Link>
            </div>

            <p className="mt-6 text-sm text-muted">
              Free account. A .txt export, up to 10 MiB.
            </p>
          </div>

          <DemoChat />
        </section>

        {/* WHAT YOU FIND OUT */}
        <section
          aria-labelledby="discoveries-title"
          className={`${container} py-20 lg:py-24`}
        >
          <h2
            id="discoveries-title"
            className="max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            everyone remembers the chat differently.
          </h2>

          <ul className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
            {discoveries.map((item) => (
              <li key={item.question}>
                <h3 className="font-display text-xl font-semibold tracking-tight">
                  {item.question}
                </h3>
                <p className="mt-1 font-medium text-pop">{item.answer}</p>
                <p className="mt-3 leading-relaxed text-muted">
                  {item.description}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* HOW IT WORKS + PRIVACY */}
        <section
          id="how-it-works"
          aria-labelledby="how-title"
          className={`${container} scroll-mt-8 py-20 lg:py-24`}
        >
          <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
            <div>
              <h2
                id="how-title"
                className="font-display text-3xl font-semibold tracking-tight sm:text-4xl"
              >
                three steps. one text file.
              </h2>

              <ol className="mt-10 space-y-8">
                {steps.map((step, index) => (
                  <li key={step.title} className="flex gap-4">
                    <span
                      aria-hidden="true"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-panel-2 font-display text-sm font-semibold text-accent"
                    >
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold">{step.title}</h3>
                      <p className="mt-1 leading-relaxed text-muted">
                        {step.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              <Link href="/guide" className="text-link mt-8 inline-block">
                step-by-step export guide
              </Link>
            </div>

            <aside aria-labelledby="privacy-title" className="card self-start p-6 sm:p-8">
              <h2 id="privacy-title" className="font-display text-xl font-semibold tracking-tight">
                a quick word before you upload
              </h2>
              <p className="mt-3 leading-relaxed text-muted">
                AI analysis sends participant names, statistics, and selected
                message excerpts to OpenAI. Only upload conversations you have
                permission to share.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                AI observations may be inaccurate. A shared daily allowance
                limits AI availability; statistics remain available if AI
                analysis can’t run.
              </p>
            </aside>
          </div>
        </section>

        {/* CLOSING */}
        <section aria-labelledby="closing-title" className={`${container} pt-12`}>
          <div className="card flex flex-col items-start gap-6 p-8 sm:p-10 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-muted">you could let the argument go.</p>
              <h2
                id="closing-title"
                className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl"
              >
                or you could bring receipts.
              </h2>
            </div>
            <Link href="/analyze" className="btn-primary shrink-0">
              investigate the friendship
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter line="some friendships deserve a footnote." />
    </>
  );
}

function DemoChat() {
  return (
    <figure aria-labelledby="demo-caption" className="card p-4 sm:p-6">
      <figcaption
        id="demo-caption"
        className="flex items-baseline justify-between gap-3 border-b border-line pb-4"
      >
        <span className="font-semibold">milo &amp; sam</span>
        <span className="text-sm text-muted">a fictional conversation</span>
      </figcaption>

      <ol className="space-y-2 pt-4 text-[0.9375rem]">
        {demoMessages.map((message, index) => {
          const day = message.at.slice(0, 10);
          const newDay =
            index === 0 || demoMessages[index - 1].at.slice(0, 10) !== day;
          const mine = message.sender === "sam";

          return (
            <li key={message.at + message.text}>
              {newDay && (
                <p className="py-1.5 text-center text-xs text-muted">
                  {dayLabels[day]}
                </p>
              )}
              <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <p
                  className={`max-w-[85%] px-3.5 py-2 leading-snug ${
                    mine
                      ? "rounded-[16px_16px_4px_16px] bg-accent text-on-accent"
                      : "rounded-[16px_16px_16px_4px] bg-panel-2"
                  }`}
                >
                  <span className="sr-only">{message.sender}: </span>
                  {message.text}
                  <span
                    className={`ml-2 whitespace-nowrap text-xs tabular-nums ${
                      mine ? "text-on-accent/70" : "text-muted"
                    }`}
                  >
                    {formatClock(message.at)}
                  </span>
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-5 border-t border-line pt-4">
        <dl className="grid grid-cols-3 gap-3 text-center">
          <div className="flex flex-col-reverse justify-end gap-1">
            <dt className="text-xs text-muted">milo’s share</dt>
            <dd className="font-display text-2xl font-semibold tabular-nums">
              {stats.milo.share}%
            </dd>
          </div>
          <div className="flex flex-col-reverse justify-end gap-1">
            <dt className="text-xs text-muted">sam’s slowest reply</dt>
            <dd className="font-display text-2xl font-semibold tabular-nums">
              {formatGap(stats.sam.slowestReplySeconds)}
            </dd>
          </div>
          <div className="flex flex-col-reverse justify-end gap-1">
            <dt className="text-xs text-muted">horse mentions</dt>
            <dd className="font-display text-2xl font-semibold tabular-nums">
              {stats.horseMentions}
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-center text-xs text-muted">
          calculated from the messages above. the horse remains unconfirmed.
        </p>
      </div>
    </figure>
  );
}
