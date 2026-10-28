"use client";

import { motion } from "framer-motion";
import type { AIAnalysis } from "../types/analysis";
import { Section, SectionTitle, YellowLabel } from "./ui";

export default function AIAnalysisSection({
  analysis,
}: {
  analysis: AIAnalysis | { error: string };
}) {
  return (
    <>
      {"error" in analysis ? (
        <Section>
          <div className="rounded-lg border border-yellow-400/30 bg-[#17213b] p-6 text-center">
            <p className="text-lg font-bold text-yellow-400">
              the AI needed a break
            </p>
            <p className="mt-2 text-sm text-[#b6c0d3]">
              {analysis.error} Your chat statistics are still available above.
            </p>
          </div>
        </Section>
      ) : (
        <>
          {/* AI VERDICT */}
          <Section>
            <div className="text-center">
              <YellowLabel>after careful scientific analysis*</YellowLabel>

              <p className="mt-10 text-lg text-[#95a4bf]">
                the funnier one is apparently
              </p>

              <motion.h2
                initial={{
                  scale: 0.7,
                  rotate: -3,
                  opacity: 0,
                }}
                whileInView={{
                  scale: 1,
                  rotate: 0,
                  opacity: 1,
                }}
                viewport={{
                  once: true,
                }}
                className="mt-3 text-5xl font-black uppercase text-yellow-400 wrap-anywhere sm:text-7xl md:text-8xl lg:text-9xl"
              >
                {analysis.funniest.person}
              </motion.h2>

              <p className="mt-3 text-3xl font-bold">
                {analysis.funniest.confidence}%
              </p>

              <p className="mx-auto mt-10 max-w-3xl text-xl leading-9 text-[#d1d8e5] wrap-anywhere">
                &ldquo;
                {analysis.funniest.reason}
                &rdquo;
              </p>

              <p className="mt-7 text-xs italic text-[#66738d]">
                *science may be doing some heavy lifting here
              </p>

              {analysis.sample && (
                <p className="mx-auto mt-3 max-w-2xl text-xs text-[#66738d]">
                  {analysis.sample.sampledMessages ===
                  analysis.sample.readableMessages
                    ? `based on all ${analysis.sample.readableMessages.toLocaleString()} text messages plus the stats.`
                    : `based on ${analysis.sample.sampledMessages.toLocaleString()} of ${analysis.sample.readableMessages.toLocaleString()} text messages, in ${analysis.sample.excerpts} excerpts from across the chat, plus the stats. it didn’t read everything.`}
                </p>
              )}
            </div>

            <div className="mx-auto mt-20 max-w-4xl border-l-4 border-yellow-400 pl-7">
              <p className="mb-4 text-sm font-bold text-yellow-400">
                okay but what&apos;s the actual dynamic
              </p>

              <p className="text-xl leading-9 text-[#c5cddd] wrap-anywhere">
                {analysis.conversationDynamic}
              </p>
            </div>
          </Section>

          {/* PERSONALITIES */}
          <Section dark>
            <SectionTitle
              eyebrow="for the character study"
              title="texting personalities"
              text={
                Object.keys(analysis.participants).length > 2
                  ? "somehow a language model has opinions about all of you now."
                  : "somehow a language model has opinions about both of you now."
              }
            />

            <div className="grid gap-10 md:grid-cols-2">
              {Object.entries(analysis.participants).map(
                ([name, participant], index) => (
                  <motion.div
                    key={name}
                    initial={{
                      opacity: 0,
                      x: index % 2 === 0 ? -30 : 30,
                    }}
                    whileInView={{
                      opacity: 1,
                      x: 0,
                    }}
                    viewport={{
                      once: true,
                    }}
                    className="min-w-0"
                  >
                    <p className="mb-3 font-mono text-sm text-yellow-400 wrap-anywhere">
                      {name.toLowerCase()}.txt
                    </p>

                    <div className="border-2 border-[#364564] bg-[#111a30] p-5 shadow-xl sm:p-7">
                      <PersonalityBit
                        label="how they text"
                        value={participant.textingStyle}
                      />

                      <PersonalityBit
                        label="comedic specialization"
                        value={participant.humorStyle}
                      />

                      <PersonalityBit
                        label="role in the chat"
                        value={participant.summary}
                        last
                      />
                    </div>
                  </motion.div>
                ),
              )}
            </div>
          </Section>

          {/* LORE */}
          <Section>
            <SectionTitle
              eyebrow="conversation lore"
              title="things that refuse to die"
              text="topics and bits that apparently deserve recurring roles in your friendship."
            />

            <div>
              <p className="mb-6 text-2xl font-bold text-yellow-400">
                things you somehow keep talking about
              </p>

              <div className="flex flex-wrap gap-3">
                {analysis.recurringTopics.map((topic, index) => (
                  <motion.span
                    key={`${topic}-${index}`}
                    initial={{
                      opacity: 0,
                      rotate: index % 2 === 0 ? -3 : 3,
                    }}
                    whileInView={{
                      opacity: 1,
                    }}
                    whileHover={{
                      scale: 1.08,
                      rotate: 0,
                    }}
                    viewport={{
                      once: true,
                    }}
                    className="max-w-full border-2 border-yellow-400 bg-[#17213b] px-4 py-2 text-sm font-semibold shadow-lg wrap-anywhere"
                  >
                    {topic}
                  </motion.span>
                ))}
              </div>
            </div>

            <div className="mt-16 grid gap-14 lg:grid-cols-2">
              <LoreList
                title="recurring bits that refuse to die"
                items={analysis.insideJokesOrPatterns}
              />

              <LoreList
                title="things the machine noticed"
                items={analysis.interestingObservations}
              />
            </div>
          </Section>
        </>
      )}
    </>
  );
}

function PersonalityBit({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={last ? "pt-6" : "border-b border-[#33415d] py-6 first:pt-0"}
    >
      <p className="mb-2 text-sm font-bold text-yellow-400">{label}:</p>

      <p className="leading-7 text-[#c3ccdc] wrap-anywhere">{value}</p>
    </div>
  );
}

function LoreList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="mb-8 text-2xl font-black text-yellow-400">{title}</h3>

      <div className="space-y-6">
        {items.map((item, index) => (
          <motion.div
            key={`${item}-${index}`}
            initial={{
              opacity: 0,
              x: -15,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              delay: index * 0.04,
            }}
            className="flex gap-5"
          >
            <span className="min-w-8 font-mono text-lg font-bold text-[#5f6f90]">
              {String(index + 1).padStart(2, "0")}.
            </span>

            <p className="min-w-0 leading-7 text-[#c1cadb] wrap-anywhere">{item}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
