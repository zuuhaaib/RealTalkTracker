import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, MessageCircleMore } from "lucide-react";

import ExportGuide from "../../components/ExportGuide";

export const metadata: Metadata = {
  title: "Export your chat | TalkTracker",
  description:
    "Prepare your WhatsApp or copied Instagram conversation for TalkTracker.",
};

const focusStyle =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-yellow-400";

export default function GuidePage() {
  return (
    <main
      className="min-h-screen overflow-hidden text-white"
      style={{
        background:
          "radial-gradient(circle at 50% 10%, #263a5a 0%, #1a2942 28%, #111a2d 58%, #0a1020 100%)",
      }}
    >
      {/* NAV */}
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-6 lg:px-10"
      >
        <Link
          href="/"
          aria-label="TalkTracker home"
          className={`flex items-center gap-3 rounded-sm ${focusStyle}`}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-400 text-[#0b132b] shadow-lg">
            <MessageCircleMore size={20} aria-hidden="true" />
          </span>

          <span className="text-lg font-bold tracking-tight">talktracker</span>
        </Link>

        <Link
          href="/analyze"
          className={`flex items-center gap-2 rounded-sm text-sm text-[#b6c0d3] transition hover:text-yellow-400 ${focusStyle}`}
        >
          <ArrowLeft size={16} aria-hidden="true" />
          upload a chat
        </Link>
      </nav>

      {/* INTRO */}
      <header className="mx-auto max-w-7xl px-6 pb-12 pt-12 sm:pt-20 lg:px-10">
        <p className="text-sm font-semibold text-yellow-400">
          first, acquire the evidence.
        </p>

        <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-6xl">
          bring the chat.
          <span className="block text-yellow-400">leave the screenshots.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-[#b6c0d3]">
          Here’s how to prepare a WhatsApp export or copied Instagram
          conversation. Choose your platform below, then come back with the text
          file.
        </p>

        <p className="mt-4 text-sm text-[#a4b1c7]">
          A .txt file up to 10 MiB. No account passwords required.
        </p>
      </header>

      {/* EXISTING GUIDE COMPONENT */}
      <ExportGuide />

      {/* BACK TO UPLOAD */}
      <section
        aria-labelledby="ready-title"
        className="mx-auto max-w-3xl px-6 pb-24 text-center"
      >
        <p className="text-sm font-semibold text-yellow-400">file acquired?</p>

        <h2 id="ready-title" className="mt-4 text-3xl font-black sm:text-5xl">
          alright. let’s overthink it.
        </h2>

        <p className="mt-5 text-sm leading-7 text-[#b6c0d3]">
          Only upload conversations you have permission to share. AI analysis
          sends participant names, statistics, and selected message excerpts to
          OpenAI.
        </p>

        <Link
          href="/analyze"
          className={`mt-7 inline-flex items-center justify-center gap-3 rounded-lg bg-yellow-400 px-6 py-4 font-bold text-[#0b132b] transition hover:bg-yellow-300 ${focusStyle}`}
        >
          upload your chat
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#33415d] bg-[#091126]/50">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 px-6 py-8 text-sm text-[#a4b1c7] sm:flex-row lg:px-10">
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
