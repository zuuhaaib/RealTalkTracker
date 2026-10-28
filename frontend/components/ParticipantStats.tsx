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

      <div className="mb-12 flex h-8 overflow-hidden rounded-lg border-2 border-[#344363] bg-[#0b132b]">
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
            className={`flex items-center justify-center text-xs font-black ${
              index === 0
                ? "bg-yellow-400 text-[#0b132b]"
                : "bg-[#62749c] text-white"
            }`}
          >
            {stats.messagePercentage > 15
              ? `${name} ${stats.messagePercentage}%`
              : ""}
          </motion.div>
        ))}
      </div>

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
              className={`border-2 p-7 shadow-xl ${
                index === 0
                  ? "border-yellow-400 bg-[#18233e]"
                  : "border-[#526486] bg-[#18233e]"
              }`}
            >
              <div className="mb-8 flex items-end justify-between">
                <h3
                  className={`text-4xl font-black ${
                    index === 0 ? "text-yellow-400" : "text-white"
                  }`}
                >
                  {name}
                </h3>

                <p className="text-4xl font-black text-[#637496]">
                  {stats.messagePercentage}%
                </p>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-7">
                <RawStat
                  label="messages"
                  value={stats.messages.toLocaleString()}
                />

                <RawStat label="words" value={stats.words.toLocaleString()} />

                <RawStat
                  label="response time"
                  value={formatResponseTime(
                    behavior?.medianResponseTimeSeconds ?? null,
                  )}
                />

                <RawStat
                  label="double texts"
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
    </Section>
  );
}

function RawStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-[#71809f]">{label}</p>

      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}
