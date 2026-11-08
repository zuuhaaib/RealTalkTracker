"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { AnalyzeResponse } from "../../types/analysis";
import { getBrowserSupabase } from "../../lib/supabase/client";
import {
  SiteFooter,
  SiteHeader,
  SkipLink,
  container,
} from "../../components/ui";
import AwardsSection from "../../components/AwardsSection";
import ActivitySection from "../../components/ActivitySection";
import AIAnalysisSection from "../../components/AIAnalysisSection";
import ParticipantStatsSection from "../../components/ParticipantStats";
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
    <>
      <SkipLink />
      <SiteHeader current="analyze" />

      <main id="main-content" className={`${container} pt-8 sm:pt-12`}>
        {/* UPLOAD */}
        <section
          aria-labelledby="upload-title"
          className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16"
        >
          <div>
            <h1
              id="upload-title"
              className="font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl"
            >
              upload the chat. we’ll overthink it.
            </h1>

            <p className="mt-4 max-w-md text-lg leading-relaxed text-muted">
              bring your WhatsApp or Instagram text export. we’ll handle the
              statistics, awards, and potentially unnecessary observations.
            </p>

            <Link href="/guide" className="text-link mt-6 inline-block">
              wait, how do i get my chat file?
            </Link>
          </div>

          <UploadSection
            file={file}
            loading={loading}
            error={error}
            selectFile={selectFile}
            handleAnalyze={handleAnalyze}
          />
        </section>

        {/* LOADING */}
        <div aria-live="polite" aria-busy={loading}>
          {loading && (
            <section aria-label="Analysis in progress" className="card mt-12 p-6 sm:p-8">
              <p className="font-display text-2xl font-semibold tracking-tight">
                reading years of lore…
              </p>

              <ul className="mt-4 space-y-2 text-muted">
                <LoadingLine>counting every unnecessary double text</LoadingLine>
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
              </ul>
            </section>
          )}
        </div>

        {/* RESULTS */}
        {data && (
          <div className="mt-20 space-y-20 sm:mt-24 sm:space-y-24">
            <section
              aria-labelledby="results-title"
              className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-sm text-muted">the damage</p>
                <h2
                  id="results-title"
                  ref={resultsHeading}
                  tabIndex={-1}
                  className="mt-1 font-display text-4xl font-semibold tracking-tight [overflow-wrap:anywhere] focus:outline-none sm:text-5xl"
                >
                  {participantNames}
                </h2>
              </div>

              <div className="shrink-0 sm:text-right">
                <p className="font-display text-5xl font-semibold tracking-tight text-accent tabular-nums">
                  {data.messageCount.toLocaleString()}
                </p>
                <p className="mt-1 max-w-xs text-sm text-muted">
                  messages analyzed for reasons nobody can adequately explain.
                  detected: {data.platform}
                </p>
              </div>
            </section>

            <ParticipantStatsSection
              statistics={data.statistics}
              behaviorByName={data.behavior}
            />

            <AwardsSection
              awards={data.awards}
              isGroup={participants.length > 2}
            />

            <ActivitySection activity={data.activity} />

            <AIAnalysisSection analysis={data.aiAnalysis} />
          </div>
        )}
      </main>

      <SiteFooter line="statistics, inside jokes, and questionable judgment." />
    </>
  );
}

function LoadingLine({ children }: { children: string }) {
  return (
    <li className="flex items-center gap-3">
      <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
      <span>{children}</span>
    </li>
  );
}
