"use client";

import Link from "next/link";
import { useState } from "react";

import type { AnalyzeResponse } from "../types/analysis";
import { MAX_SAVED, SaveError, saveAnalysis } from "../lib/savedAnalyses";

// Keeping a result is always a choice: nothing is stored until this is pressed.
export default function SaveButton({ data }: { data: AnalyzeResponse }) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "limit" | "failed">("idle");

  async function save() {
    if (status === "saving" || status === "saved") return;

    setStatus("saving");

    try {
      await saveAnalysis(data);
      setStatus("saved");
    } catch (error) {
      setStatus(error instanceof SaveError && error.reason === "limit" ? "limit" : "failed");
    }
  }

  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
      <button
        type="button"
        onClick={save}
        disabled={status === "saving" || status === "saved"}
        className="send min-h-11 px-5 py-2 text-base"
      >
        {status === "saving" ? "saving…" : status === "saved" ? "saved." : "save this"}
      </button>

      <p role="status" className="text-base text-muted">
        {status === "saved" && (
          <Link href="/saved" className="text-link">
            see your saved chats
          </Link>
        )}
        {status === "limit" && (
          <>
            you&rsquo;ve got {MAX_SAVED} saved already.{" "}
            <Link href="/saved" className="text-link">
              delete one first
            </Link>
            .
          </>
        )}
        {status === "failed" && "couldn’t save that. try again in a moment."}
        {(status === "idle" || status === "saving") &&
          "keeps these results on your account. never the chat file. otherwise they vanish when you leave."}
      </p>
    </div>
  );
}
