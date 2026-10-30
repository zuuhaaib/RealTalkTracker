"use client";

import Link from "next/link";
import { MotionConfig, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  CheckCheck,
  FileText,
  MessageCircleMore,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const messages = [
  {
    sender: "alex",
    text: "i feel like i'm carrying this conversation",
    time: "11:42",
    outgoing: false,
  },
  {
    sender: "sam",
    text: "you sent me 14 messages about a sandwich",
    time: "11:42",
    outgoing: true,
  },
  {
    sender: "alex",
    text: "it had structural issues",
    time: "11:43",
    outgoing: false,
  },
  {
    sender: "sam",
    text: "so does this argument",
    time: "11:43",
    outgoing: true,
  },
];

const discoveries = [
  {
    number: "01",
    question: "“i always text first.”",
    answer: "let’s count.",
    description:
      "Message shares, conversation starts, consecutive texts, and median reply gaps. Definitions included.",
  },
  {
    number: "02",
    question: "“we don’t talk that much.”",
    answer: "your 3 AM activity says otherwise.",
    description:
      "See when the conversation happens, from your busiest hours to the months you had the most to say.",
  },
  {
    number: "03",
    question: "“i’m obviously the funny one.”",
    answer: "we asked for an outside opinion.",
    description:
      "AI reads selected excerpts and offers its take on your humor, recurring bits, and texting styles. It can be wrong.",
  },
];

const steps = [
  {
    title: "export the conversation",
    text: "Use a WhatsApp text export without media, or prepare copied Instagram text in the supported format.",
  },
  {
    title: "upload your .txt file",
    text: "No account or passwords. Just your chat file, up to 10 MiB.",
  },
  {
    title: "see what turns up",
    text: "Explore participation, texting habits, activity charts, awards, and AI commentary when available.",
  },
];

const focusStyle =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-400";

const primaryButton = `inline-flex items-center justify-center gap-3 rounded-full bg-yellow-400 px-7 py-4 font-bold text-[#10182a] transition hover:bg-yellow-300 ${focusStyle}`;

export default function LandingPage() {
  return (
    <MotionConfig reducedMotion="user">
      <main className="relative isolate min-h-screen overflow-hidden bg-[#0b1222] text-[#f4f1e9]">
        {/* Background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[1000px]"
          style={{
            background:
              "radial-gradient(ellipse at 50% 25%, rgba(62, 83, 128, 0.3), transparent 65%)",
          }}
        />

        <a
          href="#main-content"
          className={`sr-only fixed left-4 top-4 z-50 rounded-lg bg-yellow-400 px-4 py-3 font-bold text-[#10182a] focus:not-sr-only ${focusStyle}`}
        >
          skip to content
        </a>

        {/* Navigation */}
        <nav
          aria-label="Main navigation"
          className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10"
        >
          <Link
            href="/"
            aria-label="TalkTracker home"
            className={`flex items-center gap-2.5 rounded-md ${focusStyle}`}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-400 text-[#10182a]">
              <MessageCircleMore size={20} aria-hidden="true" />
            </span>

            <span className="text-lg font-extrabold tracking-tight">
              talktracker
              <span className="text-yellow-400">.</span>
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <a
              href="#how-it-works"
              className={`hidden rounded-sm text-sm text-[#b2bdd1] transition hover:text-white sm:block ${focusStyle}`}
            >
              how it works
            </a>

            <Link
              href="/analyze"
              className={`inline-flex items-center gap-2 rounded-full border border-[#43516a] px-4 py-2.5 text-sm font-semibold transition hover:border-yellow-400 hover:text-yellow-400 ${focusStyle}`}
            >
              settle the debate
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section
          id="main-content"
          className="mx-auto max-w-5xl px-6 pb-10 pt-16 text-center sm:pt-24 lg:pt-28"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b2bdd1] sm:text-sm">
              a deeply unnecessary analysis of your texts
            </p>

            <h1 className="mt-7 text-[clamp(3.2rem,8.5vw,7rem)] font-black leading-[0.98] tracking-[-0.055em]">
              who’s actually
              <span className="block text-yellow-400">carrying the chat?</span>
            </h1>

            <p className="mx-auto mt-7 max-w-xl text-base leading-7 text-[#b2bdd1] sm:text-lg sm:leading-8">
              Every friendship has competing accounts of events. Your chat
              export has the numbers.
            </p>

            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
              <Link href="/analyze" className={primaryButton}>
                alright, settle it
                <ArrowRight size={18} aria-hidden="true" />
              </Link>

              <a
                href="#the-evidence"
                className={`inline-flex items-center gap-2 rounded-sm py-2 text-sm font-semibold text-[#c2ccdd] transition hover:text-yellow-400 ${focusStyle}`}
              >
                wat dat means
                <ArrowDown size={15} aria-hidden="true" />
              </a>
            </div>

            <p className="mt-5 text-xs text-[#9ba9c0]">
              WhatsApp & copied Instagram chats · no account required
            </p>
          </motion.div>
        </section>

        {/* Fictional conversation */}
        <section
          aria-labelledby="example-heading"
          className="relative mx-auto max-w-3xl px-6 pb-20 pt-8 sm:pt-12"
        >
          <div
            aria-hidden="true"
            className="absolute left-3 top-32 hidden -rotate-12 font-mono text-xs text-[#a4b1c7] md:block"
          >
            sound familiar?
          </div>

          <motion.figure
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mx-auto max-w-lg"
          >
            <figcaption
              id="example-heading"
              className="mb-6 text-center font-mono text-xs text-[#a4b1c7]"
            >
              exhibit a — a fictional conversation
            </figcaption>

            <div className="rounded-[28px] border border-[#34425a] bg-[#101a2c] p-5 shadow-2xl shadow-black/20 sm:p-7">
              <div className="mb-7 flex items-center gap-3 border-b border-[#2c3950] pb-5">
                <div
                  aria-hidden="true"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2b3850] text-sm font-bold text-yellow-300"
                >
                  a+s
                </div>

                <div>
                  <p className="text-sm font-bold">alex & sam</p>
                  <p className="mt-0.5 text-xs text-[#a4b1c7]">
                    an ongoing disagreement
                  </p>
                </div>

                <MessageCircleMore
                  size={20}
                  aria-hidden="true"
                  className="ml-auto text-[#a4b1c7]"
                />
              </div>

              <ol className="space-y-4">
                {messages.map((message, index) => (
                  <motion.li
                    key={`${message.sender}-${index}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.35,
                      delay: 0.3 + index * 0.12,
                    }}
                    className={`flex ${
                      message.outgoing ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl px-4 py-3 sm:max-w-[82%] ${
                        message.outgoing
                          ? "rounded-br-sm bg-yellow-300 text-[#172033]"
                          : "rounded-bl-sm bg-[#24324a] text-[#f4f1e9]"
                      }`}
                    >
                      <p
                        className={`mb-1 text-xs font-bold ${
                          message.outgoing ? "text-[#46502b]" : "text-[#b6c7e4]"
                        }`}
                      >
                        {message.sender}
                      </p>

                      <p className="text-sm leading-6 sm:text-base">
                        {message.text}
                      </p>

                      <div
                        className={`mt-1.5 flex items-center justify-end gap-1 text-[10px] ${
                          message.outgoing ? "text-[#4b5439]" : "text-[#adbad0]"
                        }`}
                      >
                        <span>{message.time}</span>

                        {message.outgoing && (
                          <CheckCheck size={13} aria-hidden="true" />
                        )}
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ol>
            </div>

            <p className="mt-5 text-center text-sm text-[#a4b1c7]">
              Some arguments require outside arbitration.
            </p>
          </motion.figure>
        </section>

        {/* Evidence reveal */}
        <section
          id="the-evidence"
          aria-labelledby="evidence-heading"
          className="scroll-mt-8 border-y border-[#33415a] bg-[#172238] text-[#f4f1e9]"
        >
          <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20 lg:px-10">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#b2bdd1]">
                  exhibit b / the hypothetical findings
                </p>

                <h2
                  id="evidence-heading"
                  className="mt-4 text-4xl font-black tracking-tight sm:text-5xl"
                >
                  okay. let’s check the record.
                </h2>
              </div>

              <span className="w-fit -rotate-3 border-2 border-yellow-400/50 px-3 py-1.5 font-mono text-xs font-bold uppercase text-yellow-400">
                fictional example
              </span>
            </div>

            <dl className="mt-12 grid gap-8 sm:grid-cols-3 sm:gap-10">
              <div className="border-t-2 border-[#43516a] pt-5">
                <dt className="text-sm font-semibold text-[#b2bdd1]">
                  messages sent by alex
                </dt>

                <dd className="mt-3 text-6xl font-black tracking-tight">62%</dd>

                <dd className="mt-3 text-sm leading-6 text-[#b2bdd1]">
                  a numerical lead. the sandwich helped.
                </dd>
              </div>

              <div className="border-t-2 border-[#43516a] pt-5">
                <dt className="text-sm font-semibold text-[#b2bdd1]">
                  sam’s median reply gap
                </dt>

                <dd className="mt-3 text-6xl font-black tracking-tight">
                  4<span className="ml-1 text-2xl">min</span>
                </dd>

                <dd className="mt-3 text-sm leading-6 text-[#b2bdd1]">
                  possibly workshopping the comeback.
                </dd>
              </div>

              <div className="border-t-2 border-[#43516a] pt-5">
                <dt className="text-sm font-semibold text-[#b2bdd1]">
                  AI’s pick for the funny one
                </dt>

                <dd className="mt-3 text-6xl font-black tracking-tight">
                  sam
                  <span className="text-3xl">*</span>
                </dd>

                <dd className="mt-3 text-sm leading-6 text-[#b2bdd1]">
                  alex has requested a recount.
                </dd>
              </div>
            </dl>

            <p className="mt-10 max-w-3xl border-t border-[#43516a] pt-5 text-xs leading-6 text-[#b2bdd1]">
              Made-up findings for illustration, not calculated from the four
              messages above. *AI judgments are subjective. Message counts and
              reply gaps don’t measure how much someone cares.
            </p>
          </div>
        </section>

        {/* What you discover */}
        <section
          aria-labelledby="discoveries-heading"
          className="mx-auto max-w-6xl px-6 py-20 sm:py-28 lg:px-10"
        >
          <div className="mb-12 max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-yellow-400">
              familiar claims. actual numbers.
            </p>

            <h2
              id="discoveries-heading"
              className="mt-4 text-4xl font-black tracking-tight sm:text-5xl"
            >
              everyone remembers
              <br />
              the chat differently.
            </h2>
          </div>

          <div>
            {discoveries.map((item) => (
              <article
                key={item.number}
                className="grid gap-5 border-t border-[#33415a] py-8 sm:grid-cols-[48px_1fr] lg:grid-cols-[48px_1fr_0.9fr] lg:gap-10 lg:py-10"
              >
                <span
                  aria-hidden="true"
                  className="font-mono text-sm text-yellow-400"
                >
                  {item.number}
                </span>

                <div>
                  <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    {item.question}
                  </h3>

                  <p className="mt-2 text-lg font-semibold text-yellow-400">
                    {item.answer}
                  </p>
                </div>

                <p className="max-w-xl text-sm leading-7 text-[#b2bdd1] sm:col-start-2 lg:col-start-auto">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Short walkthrough */}
        <section
          id="how-it-works"
          aria-labelledby="how-heading"
          className="scroll-mt-8 border-y border-[#33415a] bg-[#111c30]"
        >
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:px-10">
            <div>
              <FileText
                size={27}
                aria-hidden="true"
                className="text-yellow-400"
              />

              <h2
                id="how-heading"
                className="mt-5 text-3xl font-black tracking-tight sm:text-4xl"
              >
                you bring the chat.
                <br />
                we bring a spreadsheet
                <br className="hidden sm:block" /> mentality.
              </h2>

              <Link
                href="/guide"
                className={`mt-6 inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-yellow-400 underline decoration-yellow-400/40 underline-offset-4 ${focusStyle}`}
              >
                how do i get my chat file?
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>

            <ol className="space-y-7">
              {steps.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#465570] font-mono text-xs text-yellow-400"
                  >
                    {index + 1}
                  </span>

                  <div>
                    <h3 className="font-bold">{step.title}</h3>

                    <p className="mt-2 text-sm leading-7 text-[#b2bdd1]">
                      {step.text}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Privacy */}
        <section
          aria-labelledby="privacy-heading"
          className="mx-auto max-w-3xl px-6 py-16 text-center sm:py-20"
        >
          <ShieldCheck
            size={26}
            aria-hidden="true"
            className="mx-auto text-[#b2bdd1]"
          />

          <h2
            id="privacy-heading"
            className="mt-4 text-xl font-bold sm:text-2xl"
          >
            a quick word before you upload.
          </h2>

          <p className="mt-4 text-sm leading-7 text-[#b2bdd1]">
            AI analysis sends participant names, statistics, and selected
            message excerpts to OpenAI. Only upload conversations you have
            permission to share.
          </p>

          <p className="mt-3 text-xs leading-6 text-[#9ba9c0]">
            AI observations may be inaccurate. A shared daily allowance limits
            AI availability; statistics remain available if AI analysis can’t
            run.
          </p>
        </section>

        {/* Final invitation */}
        <section className="px-6 pb-24 pt-4 text-center sm:pb-28">
          <Sparkles
            size={22}
            aria-hidden="true"
            className="mx-auto mb-5 text-yellow-400"
          />

          <p className="text-sm text-[#b2bdd1]">
            you could let the argument go.
          </p>

          <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">
            or you could bring receipts.
          </h2>

          <Link href="/analyze" className={`${primaryButton} mt-8`}>
            investigate the friendship
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </section>

        {/* Footer */}
        <footer className="border-t border-[#33415a]">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-7 text-xs text-[#a4b1c7] sm:flex-row sm:items-center sm:justify-between lg:px-10">
            <p>
              built by{" "}
              <span className="font-semibold text-[#e2e7ef]">zuhaib khan</span>
            </p>

            <p>some friendships deserve a footnote.</p>
          </div>
        </footer>
      </main>
    </MotionConfig>
  );
}
