"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { AnalyzeResponse } from "../../types/analysis";
import { getBrowserSupabase } from "../../lib/supabase/client";
import { SiteFooter, SiteHeader, SkipLink, column, container, stagger } from "../../components/ui";
import JumpNav from "../../components/JumpNav";
import { byMessages, summarize } from "../../lib/edition";
import AwardsSection from "../../components/AwardsSection";
import ActivitySection from "../../components/ActivitySection";
import AIAnalysisSection from "../../components/AIAnalysisSection";
import ParticipantStatsSection from "../../components/ParticipantStats";
import ShareCards from "../../components/ShareCards";
import StorySection from "../../components/StorySection";
import UploadSection from "../../components/UploadSection";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL?.trim() ||
  (process.env.NODE_ENV === "development" ? "http://127.0.0.1:8000" : "")
).replace(/\/+$/, "");

const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Back to the login page, then straight back here once signed in.
function sendToLogin(reason: "expired") {
  // A full page load, so the proxy re-checks the (now cleared) session
  // instead of the router reusing a cached page.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.assign(`/login?next=%2Fanalyze&error=${reason}`);
}

export default function AnalyzePage() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<AnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const resultsHeading = useRef<HTMLHeadingElement>(null);
  const uploadHeading = useRef<HTMLHeadingElement>(null);

  // Move focus to the results when they arrive, so keyboard and screen
  // reader users land on them instead of a disabled button.
  useEffect(() => {
    if (data) resultsHeading.current?.focus();
  }, [data]);

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
      // The backend only analyzes chats for signed-in users.
      const supabase = getBrowserSupabase();
      const session = supabase
        ? (await supabase.auth.getSession()).data.session
        : null;

      if (!supabase || !session) {
        sendToLogin("expired");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: formData,
      });

      if (response.status === 401) {
        await supabase.auth.signOut();
        sendToLogin("expired");
        return;
      }

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

  // Back to an empty message box, for the next chat.
  function startOver() {
    setData(null);
    setFile(null);
    setError("");
    window.scrollTo({ top: 0 });
    // Wait for the box to render before moving focus to it.
    window.requestAnimationFrame(() => uploadHeading.current?.focus());
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
  const isGroup = participants.length > 2;
  const top = data ? byMessages(data)[0] : null;
  const facts = data ? summarize(data) : [];
  const story = data && !("error" in data.aiAnalysis) ? data.aiAnalysis.story : undefined;

  return (
    <>
      <SkipLink />
      <SiteHeader current="analyze" />

      <main id="main-content">
        {!data && (
          /* THE MESSAGE BOX */
          <section aria-labelledby="upload-title" className={`${column} pt-12 pb-20 sm:pt-20`}>
            <h1
              id="upload-title"
              ref={uploadHeading}
              tabIndex={-1}
              className="say text-[clamp(3rem,1.6rem+5vw,5.5rem)] focus:outline-none"
            >
              send the chat.
            </h1>
            <p className="mt-5 max-w-[44ch] text-xl text-muted">
              a WhatsApp or Instagram text export. we&rsquo;ll count it, and a machine will have
              opinions.{" "}
              <Link href="/guide" className="text-link">
                how do i get the file?
              </Link>
            </p>

            <div className="mt-10">
              <UploadSection
                file={file}
                loading={loading}
                error={error}
                selectFile={selectFile}
                handleAnalyze={handleAnalyze}
              />
            </div>
          </section>
        )}

        {/* TYPING */}
        <div aria-live="polite" aria-busy={loading}>
          {loading && <Typing />}
        </div>

        {/* THE REPLY */}
        {data && top && (
          <div className={`${container} pt-6`}>
            {/* What was analysed, and a way to do another. */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-bg-2 p-3 pl-5 sm:rounded-full sm:py-2 sm:pr-2">
              <p className="min-w-0 text-base text-muted tabular [overflow-wrap:anywhere]">
                <span className="font-semibold text-ink">{file?.name ?? "your chat"}</span> ·{" "}
                {data.messageCount.toLocaleString()} {data.platform === "whatsapp" ? "WhatsApp" : "Instagram"} messages
              </p>
              <button type="button" onClick={startOver} className="send min-h-10 px-4 py-2 text-base">
                upload another
              </button>
            </div>

            {/* THE VERDICT AND THE TL;DR */}
            <section aria-labelledby="results-title" className="pt-14 pb-10 sm:pt-20">
              <h1
                id="results-title"
                ref={resultsHeading}
                tabIndex={-1}
                className="say max-w-[16ch] text-[clamp(2.75rem,1.5rem+5vw,5.5rem)] [overflow-wrap:anywhere] focus:outline-none motion-safe:animate-[pop-in_500ms_var(--ease-out)]"
              >
                {top[0]} is carrying this {isGroup ? "group chat" : "chat"}.
              </h1>
              <p className="note mt-4 text-xl">screenshot this, send it, walk away.</p>

              <h2 id="tldr" className="sr-only scroll-mt-24">
                tl;dr
              </h2>
              <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {facts.map((fact, index) => (
                  <li
                    key={fact.id}
                    style={{ animationDelay: `${200 + index * 90}ms` }}
                    className={`min-w-0 rounded-3xl p-4 motion-safe:animate-[pop-in_500ms_var(--ease-out)_both] sm:p-6 ${
                      index === 0 ? "bg-accent" : "bg-bg-2"
                    }`}
                  >
                    <p className={`text-base ${index === 0 ? "text-ink" : "text-muted"}`}>{fact.label}</p>
                    <p className="say mt-1 text-[clamp(1.5rem,1.2rem+1.4vw,2.5rem)] [overflow-wrap:anywhere] sm:mt-2">
                      {fact.name}
                    </p>
                    <p className="mt-1 text-base">{fact.detail}</p>
                  </li>
                ))}
              </ul>
            </section>

            <JumpNav
              jumps={[
                { id: "tldr", label: "tl;dr" },
                { id: "numbers-title", label: "the numbers" },
                { id: "awards-title", label: "awards" },
                { id: "activity-title", label: "when" },
                { id: "ai-title", label: "the ai’s take" },
                ...(story ? [{ id: "story-title", label: "the story" }] : []),
                { id: "share-title", label: "share" },
              ]}
            />

            <div className="space-y-24 pt-12 sm:space-y-32 sm:pt-16">
              <ParticipantStatsSection statistics={data.statistics} behaviorByName={data.behavior} />
              <AwardsSection awards={data.awards} isGroup={isGroup} />
              <ActivitySection activity={data.activity} />
              <AIAnalysisSection analysis={data.aiAnalysis} />
              {story && <StorySection story={story} />}
              <ShareCards data={data} />
            </div>

            <section aria-labelledby="again-title" className="pt-24 sm:pt-32">
              <h2 id="again-title" data-reveal className="say text-[clamp(2.25rem,1.4rem+3.6vw,4rem)]">
                another one?
              </h2>
              <div data-reveal style={stagger(1)} className="mt-6">
                <button type="button" onClick={startOver} className="send send-accent text-lg">
                  upload another chat
                </button>
              </div>
            </section>
          </div>
        )}
      </main>

      <SiteFooter />
    </>
  );
}

const typingLines = [
  "counting every double text",
  "timing the silences",
  "checking who should’ve been asleep",
  "asking a robot who’s funnier",
  "the robot is thinking",
];

// While the server works: a typing bubble, and what it's up to.
function Typing() {
  return (
    <section aria-label="working on it" className={`${column} pb-16`}>
      <p className="inline-block rounded-full bg-bg-2 px-5 py-3 text-3xl leading-none text-muted">
        <span aria-hidden="true" className="dots">
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </span>
      </p>
      <ul className="mt-5 space-y-1 text-xl text-muted">
        {typingLines.map((line, index) => (
          <li
            key={line}
            className="motion-safe:animate-[pop-in_400ms_var(--ease-out)_both]"
            style={{ animationDelay: `${index * 1.5}s` }}
          >
            {line}…
          </li>
        ))}
      </ul>
    </section>
  );
}
