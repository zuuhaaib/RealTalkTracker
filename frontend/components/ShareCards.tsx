"use client";

import { useEffect, useState } from "react";

import type { AnalyzeResponse } from "../types/analysis";
import { buildShareCards, renderShareCard } from "../lib/shareCards";
import { SectionHeading } from "./ui";

type Rendered = {
  id: string;
  label: string;
  alt: string;
  blob: Blob;
  url: string;
};

function toFile(card: Rendered) {
  return new File([card.blob], `talktracker-${card.id}.png`, { type: "image/png" });
}

// The results as story-sized images: drawn once, here in the browser, then
// saved or handed to the phone's share sheet (where Instagram lives).
export default function ShareCards({ data }: { data: AnalyzeResponse }) {
  const [cards, setCards] = useState<Rendered[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let urls: string[] = [];

    async function render() {
      try {
        // The page's typeface has to be loaded before canvas can use it.
        const font = getComputedStyle(document.body).fontFamily;
        await Promise.all([400, 500, 700].map((weight) => document.fonts.load(`${weight} 48px ${font}`)));

        const built = buildShareCards(data);
        const blobs = await Promise.all(built.map((card) => renderShareCard(card, font)));
        if (cancelled) return;

        const rendered = built.map((card, index) => ({
          id: card.id,
          label: card.label,
          alt: card.alt,
          blob: blobs[index],
          url: URL.createObjectURL(blobs[index]),
        }));

        urls = rendered.map((card) => card.url);
        setCanShare(Boolean(navigator.canShare?.({ files: [toFile(rendered[0])] })));
        setCards(rendered);
      } catch {
        if (!cancelled) setFailed(true);
      }
    }

    render();

    return () => {
      cancelled = true;
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [data]);

  async function share(card: Rendered) {
    try {
      await navigator.share({ files: [toFile(card)] });
    } catch {
      // Closing the share sheet counts as an error. Nothing to report.
    }
  }

  if (failed) return null;

  return (
    <section aria-labelledby="share-title">
      <SectionHeading
        id="share-title"
        title="post the evidence."
        intro="sized for your story. these have real names on them, so maybe ask first."
      />

      {cards ? (
        <ul className="-mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-3 sm:-mx-8 sm:px-8">
          {cards.map((card) => (
            <li key={card.id} className="w-52 shrink-0 snap-start sm:w-60">
              {/* A blob made in this browser, so next/image has nothing to optimise. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={card.url}
                alt={card.alt}
                width={1080}
                height={1920}
                className="h-auto w-full rounded-3xl bg-bg-2 outline-2 outline-bg-2"
              />
              <p className="mt-3 text-lg font-bold">{card.label}</p>
              <div className="mt-2 flex gap-2">
                <a
                  href={card.url}
                  download={`talktracker-${card.id}.png`}
                  aria-label={`save ${card.label} image`}
                  className="send min-h-10 flex-1 px-3 py-2 text-base"
                >
                  save
                </a>
                {canShare && (
                  <button
                    type="button"
                    onClick={() => share(card)}
                    aria-label={`share ${card.label} image`}
                    className="send send-accent min-h-10 flex-1 px-3 py-2 text-base"
                  >
                    share
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p role="status" className="text-xl text-muted">
          developing the photos
          <span aria-hidden="true" className="dots">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </p>
      )}
    </section>
  );
}
