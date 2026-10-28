"use client";

import { motion } from "framer-motion";
import type { AnalyzeResponse } from "../types/analysis";
import { Section, SectionTitle } from "./ui";

export default function ParticipantStatsSection({
  statistics,
  behaviorByName,
}: {
  statistics: AnalyzeResponse["statistics"];
  behaviorByName: AnalyzeResponse["behavior"];
}) {
  const participants = Object.entries(statistics.participants);

  // With 3+ people, the next sender isn't necessarily replying to
  // the previous one, so gaps are described as gaps, not replies.
  const isGroup = participants.length > 2;

  const gapLabel = isGroup ? "gap before jumping in" : "reply gap";

  const definitions = [
    {
      term: gapLabel,
      text: isGroup
        ? "median time between someone else’s message and theirs. in a group we can’t tell who they were actually answering."
        : "median time between the other person’s message and theirs. gaps of six hours or more don’t count.",
    },
    {
      term: "consecutive messages",
      text: "extra messages sent in a row before anyone else talks. a burst of six counts as five. no time limit under six hours.",
    },
    {
      term: "conversation starts",
      text: "the very first message, plus any message after six or more hours of silence.",
    },
    {
      term: "words per message",
      text: "readable words divided by all messages, including media-only ones. placeholders like “image omitted” don’t count as words.",
    },
  ];

  function formatResponseTime(seconds: number | null) {
    if (seconds === null) return "n/a";

    if (seconds < 60) {
      return `${Math.round(seconds)} sec`;
    }

    if (seconds < 3600) {
      return `${Math.round(seconds / 60)} min`;
    }

    if (seconds < 86400) {
      return `${(seconds / 3600).toFixed(1)} hr`;
    }

    return `${(seconds / 86400).toFixed(1)} days`;
  }

  return (
    <Section dark>
      {/* HEAD TO HEAD */}
      <SectionTitle
        eyebrow="head to head"
        title="so who talks more?"
        text="the cold hard numbers. no AI opinions involved yet."
      />

      {/* Names live in the legend below, so long names never get clipped
          inside narrow bar segments. */}
      <div
        aria-hidden="true"
        className="flex h-8 overflow-hidden rounded-lg border-2 border-[#344363] bg-[#0b132b]"
      >
        {participants.map(([name, stats], index) => (
          <motion.div
            key={name}
            initial={{
              width: 0,
            }}
            whileInView={{
              width: `${stats.messagePercentage}%`,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 1,
            }}
            className={barColors[index % barColors.length]}
          />
        ))}
      </div>

      <ul className="mb-12 mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {participants.map(([name, stats], index) => (
          <li key={name} className="flex min-w-0 max-w-full items-center gap-2">
            <span
              aria-hidden="true"
              className={`h-3 w-3 shrink-0 rounded-sm ${
                barColors[index % barColors.length]
              }`}
            />
            <span className="min-w-0 font-bold wrap-anywhere">{name}</span>
            <span className="shrink-0 text-[#8d9ab4]">
              {stats.messagePercentage}%
            </span>
          </li>
        ))}
      </ul>

      <div className="grid gap-8 md:grid-cols-2">
        {participants.map(([name, stats], index) => {
          const behavior = behaviorByName[name];

          return (
            <motion.div
              key={name}
              initial={{
                opacity: 0,
                y: 30,
                rotate: index % 2 === 0 ? -1 : 1,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              whileHover={{
                rotate: 0,
                scale: 1.015,
              }}
              viewport={{
                once: true,
              }}
              className={`min-w-0 border-2 p-5 shadow-xl sm:p-7 ${
                index === 0
                  ? "border-yellow-400 bg-[#18233e]"
                  : "border-[#526486] bg-[#18233e]"
              }`}
            >
              <div className="mb-8 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
                <h3
                  className={`min-w-0 max-w-full text-3xl font-black wrap-anywhere sm:text-4xl ${
                    index === 0 ? "text-yellow-400" : "text-white"
                  }`}
                >
                  {name}
                </h3>

                <p className="shrink-0 text-3xl font-black text-[#637496] sm:text-4xl">
                  {stats.messagePercentage}%
                </p>
              </div>

              <div className="grid grid-cols-2 gap-x-5 gap-y-7 sm:gap-x-8">
                <RawStat
                  label="messages"
                  value={stats.messages.toLocaleString()}
                />

                <RawStat label="words" value={stats.words.toLocaleString()} />

                <RawStat
                  label={`median ${gapLabel}`}
                  value={formatResponseTime(
                    behavior?.medianResponseTimeSeconds ?? null,
                  )}
                />

                {/* API key stays doubleTexts; the label says what it counts. */}
                <RawStat
                  label="consecutive messages"
                  value={(behavior?.doubleTexts ?? 0).toLocaleString()}
                />

                <RawStat
                  label="conversation starts"
                  value={(behavior?.conversationStarts ?? 0).toLocaleString()}
                />

                <RawStat
                  label="words per message"
                  value={stats.averageWordsPerMessage.toString()}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-12 rounded-lg border border-[#344363] bg-[#0f172a]/50 p-6">
        <p className="mb-4 text-sm font-bold text-yellow-400">
          how we count this, so nobody gets litigated unfairly
        </p>

        <dl className="grid gap-x-10 gap-y-4 text-sm leading-6 md:grid-cols-2">
          {definitions.map(({ term, text }) => (
            <div key={term}>
              <dt className="font-semibold text-white">{term}</dt>
              <dd className="text-[#94a3b8]">{text}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}

const barColors = [
  "bg-yellow-400 text-[#0b132b]",
  "bg-[#62749c] text-white",
  "bg-[#9fb0d0] text-[#0b132b]",
  "bg-[#3d4d70] text-white",
];

function RawStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-sm text-[#71809f]">{label}</p>

      <p className="mt-1 text-2xl font-black wrap-anywhere">{value}</p>
    </div>
  );
}
