"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { MessageCircleMore } from "lucide-react";

import type { AnalyzeResponse } from "../types/analysis";
import { Section, YellowLabel } from "../components/ui";
import AwardsSection from "../components/AwardsSection";
import ActivitySection from "../components/ActivitySection";
import AIAnalysisSection from "../components/AIAnalysisSection";
import ParticipantStatsSection from "../components/ParticipantStats";
import UploadSection from "../components/UploadSection";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL?.trim() ||
  (process.env.NODE_ENV === "development" ? "http://127.0.0.1:8000" : "")
).replace(/\/+$/, "");

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<AnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAnalyze() {
    if (loading) return;

    if (!API_URL) {
      setError(
        "the server address hasn’t been configured yet. check back soon",
      );
      return;
    }

    if (!file) {
      setError("bro upload the chat first");
      return;
    }

    setLoading(true);
    setError("");
    setData(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        body: formData,
      });

      const contentType = response.headers.get("content-type") ?? "";

      if (!contentType.toLowerCase().includes("application/json")) {
        if (response.status === 413) {
          throw new Error("that file is too big. keep it under 10 MiB pls");
        }

        throw new Error(
          response.ok
            ? "the server sent an unexpected response. try again"
            : `the server hit a snag (${response.status}). try again shortly`,
        );
      }

      let result;

      try {
        result = await response.json();
      } catch {
        throw new Error(
          "the server sent an unreadable response. try again shortly",
        );
      }

      if (!response.ok) {
        throw new Error(
          typeof result?.detail === "string"
            ? result.detail
            : `couldn’t analyze this chat (${response.status}). try again`,
        );
      }

      setData(result);
    } catch (err) {
      if (err instanceof TypeError) {
        setError(
          "couldn’t reach the server. check your connection and make sure the backend is running",
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("something went wrong. try again");
      }
    } finally {
      setLoading(false);
    }
  }

  function selectFile(selectedFile: File | null) {
    if (!selectedFile || loading) return;

    setData(null);

    if (!selectedFile.name.toLowerCase().endsWith(".txt")) {
      setFile(null);
      setError("txt files only pls");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setFile(null);
      setError("that’s a lot of lore. keep the file under 10 MiB pls");
      return;
    }

    if (selectedFile.size === 0) {
      setFile(null);
      setError("this file has no lore. try a chat export with messages");
      return;
    }

    setFile(selectedFile);
    setError("");
  }

  const participants = data ? Object.entries(data.statistics.participants) : [];

  const participantNames = participants.map(([name]) => name).join(" vs ");

  return (
    <main
      className="min-h-screen overflow-hidden text-white"
      style={{
        background:
          "radial-gradient(circle at 50% 10%, #263a5a 0%, #1a2942 28%, #111a2d 58%, #0a1020 100%)",
      }}
    >
      {/* BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-32 h-96 w-96 rounded-full bg-yellow-300/[0.035] blur-3xl" />
        <div className="absolute -right-32 top-[600px] h-[500px] w-[500px] rounded-full bg-blue-300/[0.04] blur-3xl" />
      </div>

      <div className="relative">
        {/* NAV */}
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-400 text-[#0b132b] shadow-lg">
              <MessageCircleMore size={20} />
            </div>

            <span className="text-lg font-bold tracking-tight">
              talktracker
            </span>
          </motion.div>

          <p className="hidden text-sm text-[#94a3b8] sm:block">
            deeply unnecessary analysis of your texts
          </p>
        </nav>

        {/* HERO */}
        <section className="mx-auto grid min-h-[78vh] max-w-7xl items-center gap-14 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
          <motion.div
            initial={{
              opacity: 0,
              x: -40,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.8,
            }}
          >
            <p className="mb-5 text-sm font-semibold text-yellow-400">
              whatsapp + instagram analysis for people who overthink everything
            </p>

            <h1 className="max-w-3xl text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
              who&apos;s actually
              <span className="block text-yellow-400">carrying the chat?</span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-[#b6c0d3]">
              upload a conversation and find out who yaps more, who replies
              faster, who starts everything, what you somehow keep talking
              about, and who AI thinks is funnier.
            </p>

            <p className="mt-5 text-sm italic text-[#73819f]">
              therapy was apparently too expensive
            </p>
          </motion.div>

          <UploadSection
            file={file}
            loading={loading}
            error={error}
            selectFile={selectFile}
            handleAnalyze={handleAnalyze}
          />
        </section>

        {/* LOADING */}
        {loading && (
          <section className="mx-auto max-w-3xl px-6 pb-24">
            <div className="border-l-4 border-yellow-400 pl-6">
              <motion.p
                animate={{
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                }}
                className="text-2xl font-bold text-yellow-400"
              >
                reading years of lore...
              </motion.p>

              <div className="mt-6 space-y-3 text-[#94a3b8]">
                <LoadingLine>
                  counting every unnecessary double text
                </LoadingLine>

                <LoadingLine>
                  figuring out who refuses to start conversations
                </LoadingLine>

                <LoadingLine>
                  checking what time you people should have been asleep
                </LoadingLine>

                <LoadingLine>asking a machine who is funnier</LoadingLine>

                <LoadingLine>
                  preparing potentially friendship-ending statistics
                </LoadingLine>
              </div>
            </div>
          </section>
        )}

        {data && (
          <>
            {/* THE DAMAGE */}
            <Section>
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.97,
                }}
                whileInView={{
                  opacity: 1,
                  scale: 1,
                }}
                viewport={{
                  once: true,
                }}
                className="text-center"
              >
                <YellowLabel>the damage</YellowLabel>

                <h2 className="mt-5 text-4xl font-bold text-white sm:text-6xl">
                  {participantNames}
                </h2>

                <p className="mt-10 text-[90px] font-black leading-none text-yellow-400 sm:text-[130px]">
                  {data.messageCount.toLocaleString()}
                </p>

                <p className="mt-2 text-lg text-[#8190ad]">
                  messages analyzed for reasons nobody can adequately explain
                </p>

                <p className="mt-3 text-sm font-semibold text-yellow-400">
                  detected: {data.platform}
                </p>
              </motion.div>
            </Section>

            <ParticipantStatsSection
              statistics={data.statistics}
              behaviorByName={data.behavior}
            />

            <AwardsSection awards={data.awards} />

            <ActivitySection activity={data.activity} />

            <AIAnalysisSection analysis={data.aiAnalysis} />
          </>
        )}

        {/* FOOTER */}
        <footer className="border-t border-[#33415d] bg-[#091126]/50">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 px-6 py-8 text-sm text-[#66738d] sm:flex-row lg:px-10">
            <p>
              built by{" "}
              <span className="font-semibold text-yellow-400">zuhaib khan</span>
            </p>

            <p>
              next.js · fastapi · machine learning · openai · questionable
              judgment
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}

function LoadingLine({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-2 w-2 rounded-full bg-yellow-400" />
      <span>{children}</span>
    </div>
  );
}
