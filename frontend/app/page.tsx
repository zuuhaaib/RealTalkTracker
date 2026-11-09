import Link from "next/link";
import type { ReactNode } from "react";

import BadHorse from "../components/BadHorse";
import NightLine from "../components/NightLine";
import TypedLine from "../components/TypedLine";
import { SectionHeading, SiteFooter, SiteHeader, SkipLink, column, stagger } from "../components/ui";
import { formatClock, getChatStats, horseChat } from "../lib/demoChat";
import { durationInWords, formatDuration } from "../lib/format";

const horse = getChatStats(horseChat);
const [milo, sam] = horse.people;

// The margin notes on the horse chat, by message.
const notes: Record<number, string> = {
  0: "a simple question.",
  1: `${durationInWords(sam.slowestReplySeconds)} later.`,
  3: "unprompted.",
  4: "valid.",
  5: "this does not help.",
  7: "the horse has not agreed to this.",
  8: "the real question.",
  9: "question not answered. plans moved.",
};

const numbers = [
  { value: `${milo.share}%`, label: `of the chat is ${milo.name}` },
  { value: formatDuration(sam.slowestReplySeconds), label: `for ${sam.name} to reply` },
  { value: String(horse.gagMentions), label: "horse mentions. 0 horses." },
];

const counts: ReactNode[] = [
  <>who texts more</>,
  <>
    who replies <span className="struck">never</span> slower
  </>,
  <>
    who <span className="struck">ruins</span> starts every conversation
  </>,
  <>
    who&rsquo;s funnier, according to a <span className="struck">friend</span> robot
  </>,
];

const questions: { q: string; a: ReactNode }[] = [
  {
    q: "do you keep my chat?",
    a: "the chat, no. it’s read, counted and dropped. the results leave when you leave the page, unless you press save, and then they stay on your account until you delete them.",
  },
  {
    q: "what does the ai see?",
    a: "names, the stats, and up to 200 messages (each cut to 500 characters), sent to OpenAI. names aren’t swapped out, so only upload chats everyone’s fine sharing.",
  },
  {
    q: "why only 3 ai reads a day?",
    a: "each one costs real money and this is free. 3 per person, 100 for the whole site, reset at midnight toronto time. the stats never run out.",
  },
  {
    q: "group chats?",
    a: "yes. an export can’t say who was replying to whom, so reply gaps become “gap before jumping in”.",
  },
  {
    q: "is the horse real?",
    a: "unconfirmed.",
  },
];

export default function Home() {
  return (
    <>
      <SkipLink />
      <SiteHeader current="home" />

      <main id="main-content">
        {/* THE DRAFT */}
        <section aria-labelledby="hero-title" className={`${column} pt-16 pb-28 sm:pt-28 sm:pb-40`}>
          <h1
            id="hero-title"
            className="say min-h-[3lh] text-[clamp(3.25rem,1.5rem+7vw,7rem)] sm:min-h-[2lh]"
          >
            <TypedLine draft="who’s carrying the friendship" final="who’s carrying the chat?" />
          </h1>

          <p className="mt-8 max-w-[34ch] text-[clamp(1.25rem,1.1rem+0.6vw,1.6rem)] leading-snug motion-safe:animate-[pop-in_500ms_var(--ease-out)_0.5s_both]">
            upload a WhatsApp or Instagram chat. get the numbers. settle it.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 motion-safe:animate-[pop-in_500ms_var(--ease-out)_0.7s_both]">
            <Link href="/analyze" className="send send-accent text-lg">
              upload a chat
            </Link>
            <p className="text-base text-muted">free · a .txt export · 3 ai reads a day</p>
          </div>

          <NightLine />
        </section>

        {/* THE EVIDENCE */}
        <section aria-labelledby="horse-title" className={`${column} pb-28 sm:pb-40`}>
          <SectionHeading
            id="horse-title"
            title="exhibit a: the horse chat."
            intro={`ten messages between ${milo.name} and ${sam.name}, one saturday. with notes.`}
          />

          <ol data-ui aria-label="the horse chat" className="space-y-3">
            {horseChat.messages.map((message, index) => (
              <li
                key={index}
                data-reveal
                style={stagger(Math.min(index, 6))}
                className="grid gap-x-6 gap-y-0.5 sm:grid-cols-[1fr_auto] sm:items-baseline"
              >
                <p className="text-xl leading-snug">
                  <span className={`mr-2 font-bold ${message.sender === milo.name ? "text-ink" : "text-muted"}`}>
                    {message.sender}
                  </span>
                  {message.text}
                  <span className="ml-2 text-base whitespace-nowrap text-muted tabular">
                    {formatClock(message.at)}
                  </span>
                </p>
                {notes[index] && (
                  <p className="note text-lg sm:text-right">
                    <span aria-hidden="true">← </span>
                    {notes[index]}
                  </p>
                )}
              </li>
            ))}
          </ol>

          <dl className="mt-16 grid gap-8 sm:grid-cols-3">
            {numbers.map((number, index) => (
              <div key={number.label} data-reveal style={stagger(index)}>
                <dt className="sr-only">{number.label}</dt>
                <dd className="say tabular text-[clamp(3rem,2rem+3vw,4.5rem)]">{number.value}</dd>
                <dd className="mt-1 text-lg text-muted">{number.label}</dd>
              </div>
            ))}
          </dl>

          <figure data-reveal className="mt-16">
            <BadHorse
              title="A very bad drawing of a five-legged horse with two eyes on one side, standing on a balcony it does not fit on. It has been labelled ‘horse’, ‘chill’, ‘balcony’ and ‘legs (5?)’."
              className="h-auto w-full rounded-2xl bg-white p-4 sm:p-8"
            />
            <figcaption className="mt-2 text-base text-muted">
              the horse, drawn by {milo.name} from memory. which raises questions.
            </figcaption>
          </figure>
        </section>

        {/* WHAT IT COUNTS */}
        <section aria-labelledby="counts-title" className={`${column} pb-28 sm:pb-40`}>
          <SectionHeading id="counts-title" title="upload yours. it counts:" />
          <ul className="space-y-2">
            {counts.map((line, index) => (
              <li
                key={index}
                data-reveal
                style={stagger(index)}
                className="say text-[clamp(1.75rem,1.2rem+2.4vw,3rem)] [overflow-wrap:anywhere]"
              >
                {line}
              </li>
            ))}
          </ul>
          <p data-reveal className="mt-8 max-w-[52ch] text-xl">
            export the chat as text, drop it in, argue.{" "}
            <Link href="/guide" className="text-link">
              how to export it
            </Link>
            .
          </p>
        </section>

        {/* QUESTIONS */}
        <section aria-labelledby="faq-title" className={`${column} pb-28 sm:pb-40`}>
          <SectionHeading id="faq-title" title="questions you were going to ask." />
          <div className="space-y-2">
            {questions.map((item, index) => (
              <details key={item.q} data-reveal style={stagger(index)} className="group py-4">
                <summary className="flex cursor-pointer list-none items-baseline justify-between gap-6 text-2xl font-semibold [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span
                    aria-hidden="true"
                    className="text-accent-text transition-transform duration-300 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <div className="mt-3 max-w-[56ch] text-xl text-muted">{item.a}</div>
              </details>
            ))}
          </div>
        </section>

        {/* SEND */}
        <section aria-labelledby="send-title" className={`${column} pb-16`}>
          <h2 id="send-title" data-reveal className="say text-[clamp(2.75rem,1.6rem+5vw,5.5rem)]">
            go on. upload it.
          </h2>
          <div data-reveal style={stagger(1)} className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link href="/analyze" className="send send-accent text-lg">
              upload a chat
            </Link>
            <p aria-hidden="true" className="dots text-3xl leading-none text-accent-text">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
