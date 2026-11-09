"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { AnalyzeResponse } from "../types/analysis";
import { MAX_SAVED, deleteSaved, listSaved, loadSaved } from "../lib/savedAnalyses";
import type { SavedSummary } from "../lib/savedAnalyses";
import Results from "./Results";
import { column } from "./ui";

function savedOn(iso: string) {
  return new Date(iso)
    .toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    .toLowerCase();
}

// The account's saved results: a list to open or delete from.
export default function SavedAnalyses() {
  const [items, setItems] = useState<SavedSummary[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState<{ item: SavedSummary; data: AnalyzeResponse } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    let cancelled = false;

    listSaved()
      .then((rows) => {
        if (!cancelled) setItems(rows);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function openItem(item: SavedSummary) {
    setBusy(item.id);
    setNotice("");

    try {
      setOpen({ item, data: await loadSaved(item.id) });
      window.scrollTo({ top: 0 });
    } catch {
      setNotice("couldn’t open that one. try again in a moment.");
    } finally {
      setBusy(null);
    }
  }

  async function removeItem(item: SavedSummary) {
    setBusy(item.id);
    setNotice("");

    try {
      await deleteSaved(item.id);
      setItems((rows) => rows?.filter((row) => row.id !== item.id) ?? null);
      setNotice(`deleted ${item.title}. gone for good.`);
    } catch {
      setNotice("couldn’t delete that one. try again in a moment.");
    } finally {
      setBusy(null);
      setConfirming(null);
    }
  }

  function backToList() {
    setOpen(null);
    window.scrollTo({ top: 0 });
    window.requestAnimationFrame(() => heading.current?.focus());
  }

  if (open) {
    return (
      <Results
        data={open.data}
        idPrefix="saved-"
        bar={
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-bg-2 p-3 pl-5 sm:rounded-full sm:py-2 sm:pr-2">
            <p className="min-w-0 text-base text-muted tabular [overflow-wrap:anywhere]">
              <span className="font-semibold text-ink">{open.item.title}</span> · saved{" "}
              {savedOn(open.item.created_at)}
            </p>
            <button type="button" onClick={backToList} className="send min-h-10 px-4 py-2 text-base">
              back to saved
            </button>
          </div>
        }
      />
    );
  }

  return (
    <div className={`${column} pt-12 sm:pt-20`}>
      <h1 ref={heading} tabIndex={-1} className="say text-[clamp(3rem,1.6rem+5vw,5.5rem)] focus:outline-none">
        the receipts.
      </h1>

      {failed && (
        <p role="alert" className="mt-6 text-xl text-danger">
          couldn&rsquo;t load your saved chats. try again in a moment.
        </p>
      )}

      {!failed && items === null && (
        <p role="status" className="mt-6 text-xl text-muted">
          finding them
          <span aria-hidden="true" className="dots">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </p>
      )}

      {items !== null && items.length === 0 && (
        <div className="mt-6">
          <p className="max-w-[40ch] text-xl text-muted">nothing saved yet. your friendships remain undocumented.</p>
          <Link href="/analyze" className="send send-accent mt-6 text-lg">
            upload a chat
          </Link>
        </div>
      )}

      {items !== null && items.length > 0 && (
        <>
          <p className="mt-4 text-xl text-muted tabular">
            {items.length} of {MAX_SAVED} saved.
          </p>

          <ul className="mt-10 space-y-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 rounded-3xl bg-bg-2 p-5 sm:p-6"
              >
                <button
                  type="button"
                  onClick={() => openItem(item)}
                  disabled={busy !== null}
                  className="group min-w-0 flex-1 basis-60 text-left"
                >
                  <span className="say block text-[clamp(1.5rem,1.2rem+1.2vw,2.25rem)] [overflow-wrap:anywhere] group-hover:text-accent-text">
                    {item.title}
                  </span>
                  <span className="mt-1 block text-base text-muted tabular">
                    {busy === item.id && confirming !== item.id
                      ? "opening…"
                      : `${item.message_count.toLocaleString()} ${item.platform === "whatsapp" ? "WhatsApp" : "Instagram"} messages · saved ${savedOn(item.created_at)}`}
                  </span>
                </button>

                {confirming === item.id ? (
                  <div className="flex items-center gap-3">
                    <span className="text-base">delete for good?</span>
                    <button
                      type="button"
                      onClick={() => removeItem(item)}
                      disabled={busy !== null}
                      className="send min-h-10 bg-danger px-4 py-2 text-base"
                      aria-label={`yes, delete ${item.title}`}
                    >
                      yes
                    </button>
                    <button type="button" onClick={() => setConfirming(null)} className="text-link text-base">
                      no
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirming(item.id)}
                    disabled={busy !== null}
                    aria-label={`delete ${item.title}`}
                    className="text-link text-base"
                  >
                    delete
                  </button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      <p role="status" className="mt-4 text-base text-muted">
        {notice}
      </p>
    </div>
  );
}
