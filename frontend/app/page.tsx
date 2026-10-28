"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Clock3,
  FileText,
  MessageCircleMore,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";

const features = [
  {
    icon: MessageCircleMore,
    title: "the cold hard numbers",
    description:
      "who talks more, who double texts, and who starts the conversation after six hours of silence.",
  },
  {
    icon: Clock3,
    title: "a questionable sleep schedule",
    description:
      "response times and activity charts. because apparently 3 AM is when the friendship really flourishes.",
  },
  {
    icon: Sparkles,
    title: "an outside opinion",
    description:
      "AI takes a look at your humor, texting styles, recurring topics, and whatever dynamic you two have going on.",
  },
];

const steps = [
  {
    number: "01",
    title: "acquire the evidence",
    description:
      "export a WhatsApp chat without media, or prepare a copied Instagram conversation as a text file.",
  },
  {
    number: "02",
    title: "feed us the lore",
    description:
      "upload the .txt file. we count the messages, inspect the patterns, and ask AI for its unsolicited opinion.",
  },
  {
    number: "03",
    title: "receive the damage",
    description:
      "get your statistics, chat awards, activity charts, and a reading of the conversation. interpret responsibly.",
  },
];

export default function LandingPage() {
  return (
    <main
      className="min-h-screen overflow-hidden text-white"
      style={{
        background:
          "radial-gradient(circle at 70% 15%, #263a5a 0%, #17243c 35%, #0a1020 75%)",
      }}
    >
      {/* NAV */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link
          href="/"
          aria-label="TalkTracker home"
          className="flex items-center gap-3"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-400 text-[#0b132b]">
            <MessageCircleMore size={20} aria-hidden="true" />
          </span>

          <span className="text-lg font-bold tracking-tight">talktracker</span>
        </Link>

        <Link
          href="/analyze"
          className="flex items-center gap-2 text-sm font-semibold text-yellow-400 transition hover:text-yellow-200"
        >
          analyze a chat
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </nav>

      {/* HERO */}
      <section className="mx-auto grid max-w-7xl items-center gap-16 px-6 pb-24 pt-16 lg:min-h-[80vh] lg:grid-cols-2 lg:px-10 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="mb-6 text-sm font-semibold text-yellow-400">
            for people who overthink their texts
          </p>

          <h1 className="text-5xl font-black leading-[0.98] tracking-tight sm:text-7xl">
            who&apos;s actually
            <span className="block text-yellow-400">carrying the chat?</span>
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-8 text-[#b6c0d3]">
            turn your WhatsApp or Instagram conversation into stats, chat
            awards, and an AI opinion nobody technically asked for.
          </p>

          <Link
            href="/analyze"
            className="mt-9 inline-flex items-center gap-3 rounded-lg bg-yellow-400 px-6 py-4 font-bold text-[#0b132b] transition hover:bg-yellow-300"
          >
            investigate the friendship
            <ArrowRight size={19} aria-hidden="true" />
          </Link>

          <div className="mt-5">
            <Link
              href="/analyze#export-guide"
              className="text-sm text-[#b6c0d3] underline decoration-[#526486] underline-offset-4 transition hover:text-yellow-400"
            >
              wait, how do i export a chat?
            </Link>
          </div>

          <p className="mt-4 text-sm text-[#8190ad]">
            no account required. just a text export and some curiosity.
          </p>
        </motion.div>

        {/* FICTIONAL PREVIEW */}
        <motion.div
          initial={{ opacity: 0, y: 25, rotate: 2 }}
          animate={{ opacity: 1, y: 0, rotate: -1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative mx-auto w-full max-w-lg"
        >
          <div className="absolute -right-2 -top-4 z-10 rotate-6 bg-yellow-400 px-4 py-2 text-sm font-black text-[#0b132b] shadow-lg">
            the evidence is concerning
          </div>

          <div className="rounded-xl border-2 border-[#435273] bg-[#111b30] p-6 shadow-2xl sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#94a3b8]">
              fictional demo · alex vs sam
            </p>

            <div className="mt-7 flex items-end justify-between gap-4">
              <div>
                <p className="text-6xl font-black text-yellow-400">480</p>
                <p className="mt-2 text-sm text-[#94a3b8]">
                  messages. many thoughts.
                </p>
              </div>

              <MessageCircleMore
                size={42}
                className="mb-2 text-[#435273]"
                aria-hidden="true"
              />
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-yellow-400/40 bg-yellow-400/5 p-4">
                <p className="font-bold text-yellow-400">alex</p>
                <p className="mt-3 text-3xl font-black">280</p>
                <p className="mt-1 text-xs text-[#94a3b8]">messages</p>
                <p className="mt-4 text-sm text-[#c5cddd]">
                  8 sec median reply
                </p>
              </div>

              <div className="rounded-lg border border-[#435273] bg-[#18233e] p-4">
                <p className="font-bold">sam</p>
                <p className="mt-3 text-3xl font-black">200</p>
                <p className="mt-1 text-xs text-[#94a3b8]">messages</p>
                <p className="mt-4 text-sm text-[#c5cddd]">
                  42 sec median reply
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-4 rounded-lg border border-[#435273] p-4">
              <span className="rounded-full bg-yellow-400 p-3 text-[#0b132b]">
                <Trophy size={20} aria-hidden="true" />
              </span>

              <div>
                <p className="text-xs font-bold text-yellow-400">
                  biggest yapper
                </p>
                <p className="mt-1 text-xl font-black">alex</p>
                <p className="text-xs text-[#94a3b8]">bro had things to say</p>
              </div>
            </div>

            <p className="mt-5 text-xs leading-5 text-[#8190ad]">
              made-up people, made-up numbers. your actual results depend on the
              messages in your export.
            </p>
          </div>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section className="border-y border-[#34415e] bg-[#0d162b]/75">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <p className="text-sm font-bold text-yellow-400">
            an unreasonable amount of information
          </p>

          <h2 className="mt-3 max-w-2xl text-4xl font-black sm:text-5xl">
            your chat has patterns.
            <br />
            we made them everyone&apos;s problem.
          </h2>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-xl border border-[#344363] bg-[#131d33] p-7"
              >
                <Icon
                  size={26}
                  className="text-yellow-400"
                  aria-hidden="true"
                />

                <h3 className="mt-6 text-xl font-bold">{title}</h3>

                <p className="mt-3 leading-7 text-[#94a3b8]">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <p className="text-sm font-bold text-yellow-400">
          three steps to knowing too much
        </p>

        <h2 className="mt-3 text-4xl font-black sm:text-5xl">
          bring your own lore.
        </h2>

        <ol className="mt-12 grid gap-10 md:grid-cols-3">
          {steps.map((step) => (
            <li key={step.number} className="border-t-2 border-[#344363] pt-6">
              <span className="font-mono text-4xl font-black text-yellow-400">
                {step.number}
              </span>

              <h3 className="mt-5 text-xl font-bold">{step.title}</h3>

              <p className="mt-3 leading-7 text-[#94a3b8]">
                {step.description}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-12 flex items-start gap-3 text-sm leading-6 text-[#94a3b8]">
          <FileText
            size={20}
            className="mt-1 shrink-0 text-yellow-400"
            aria-hidden="true"
          />

          <p>
            .txt exports only, up to 10 MiB. copied Instagram chats need the
            supported sender, message, and timestamp layout. media files
            themselves aren&apos;t analyzed.
          </p>
        </div>

        <Link
          href="/analyze#export-guide"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-yellow-400 underline decoration-yellow-400/40 underline-offset-4 transition hover:text-yellow-200"
        >
          show me how to get my chat file
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </section>

      {/* PRIVACY */}
      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-10">
        <div className="rounded-xl border border-[#435273] bg-[#131d33] p-7 sm:p-10">
          <div className="flex items-center gap-3">
            <ShieldCheck
              size={24}
              className="shrink-0 text-yellow-400"
              aria-hidden="true"
            />

            <h2 className="text-2xl font-black">
              private conversations deserve a heads-up.
            </h2>
          </div>

          <p className="mt-5 max-w-3xl leading-7 text-[#b6c0d3]">
            AI analysis sends participant names, chat statistics, and selected
            message excerpts to OpenAI. only upload conversations you have
            permission to share.
          </p>

          <p className="mt-3 max-w-3xl leading-7 text-[#94a3b8]">
            the AI has opinions, not a psychology degree. its observations can
            be wrong, and texting statistics don&apos;t measure how much someone
            cares about you.
          </p>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#94a3b8]">
            AI availability is limited by a shared daily allowance. if it clocks
            out, your statistics can still show up.
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-6 pb-24 pt-4 text-center">
        <p className="text-sm font-semibold text-yellow-400">
          you could simply not overthink it
        </p>

        <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-black sm:text-6xl">
          but you&apos;ve made it this far.
        </h2>

        <Link
          href="/analyze"
          className="mt-8 inline-flex items-center gap-3 rounded-lg bg-yellow-400 px-6 py-4 font-bold text-[#0b132b] transition hover:bg-yellow-300"
        >
          alright, show me the damage
          <ArrowRight size={19} aria-hidden="true" />
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#33415d] bg-[#091126]/50">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 px-6 py-8 text-sm text-[#8190ad] sm:flex-row lg:px-10">
          <p>
            built by{" "}
            <span className="font-semibold text-yellow-400">zuhaib khan</span>
          </p>

          <p>statistics, inside jokes, and questionable judgment.</p>
        </div>
      </footer>
    </main>
  );
}
