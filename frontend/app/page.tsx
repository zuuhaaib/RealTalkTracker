"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  BrainCircuit,
  CalendarDays,
  Clock3,
  FileText,
  Flame,
  LoaderCircle,
  MessageCircleMore,
  MessagesSquare,
  Send,
  Sparkles,
  Trophy,
  UploadCloud,
  Zap,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ParticipantStats = {
  messages: number;
  words: number;
  characters: number;
  messagePercentage: number;
  averageWordsPerMessage: number;
};

type BehaviorStats = {
  doubleTexts: number;
  conversationStarts: number;
  medianResponseTimeSeconds: number | null;
};

type Awards = {
  biggestYapper: string | null;
  mostWords: string | null;
  longestMessages: string | null;
  conversationStarter: string | null;
  doubleTexter: string | null;
  fastestResponder: string | null;
};

type HourActivity = {
  hour: number;
  messages: number;
};

type WeekdayActivity = {
  day: string;
  messages: number;
};

type MonthActivity = {
  month: string;
  messages: number;
};

type ActivityStats = {
  messagesByHour: HourActivity[];
  messagesByWeekday: WeekdayActivity[];
  messagesByMonth: MonthActivity[];
  busiestHour: number | null;
  busiestDay: string | null;
  busiestMonth: string | null;
};

type AIAnalysis = {
  funniest: {
    person: string;
    confidence: number;
    reason: string;
  };

  participants: Record<
    string,
    {
      humorStyle: string;
      textingStyle: string;
      summary: string;
    }
  >;

  conversationDynamic: string;
  recurringTopics: string[];
  insideJokesOrPatterns: string[];
  interestingObservations: string[];
};

type AnalyzeResponse = {
  platform: "whatsapp" | "instagram";
  messageCount: number;

  statistics: {
    totalMessages: number;
    participants: Record<string, ParticipantStats>;
  };

  behavior: Record<string, BehaviorStats>;

  awards: Awards;

  activity: ActivityStats;

  aiAnalysis: AIAnalysis;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

const chartTick = {
  fill: "#9ca3af",
  fontSize: 11,
};

const tooltipStyle = {
  backgroundColor: "#111827",
  border: "1px solid #374151",
  borderRadius: "10px",
  color: "#ffffff",
};

const awardRotations = [
  "-rotate-1",
  "rotate-1",
  "rotate-[0.5deg]",
  "-rotate-[0.5deg]",
  "rotate-1",
  "-rotate-1",
];

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<AnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  async function handleAnalyze() {
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

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "something went wrong");
      }

      setData(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }

  function selectFile(selectedFile: File | null) {
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith(".txt")) {
      setError("txt files only pls");
      return;
    }

    setFile(selectedFile);
    setError("");
  }

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

  function formatHour(hour: number | null) {
    if (hour === null) return "n/a";

    const suffix = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;

    return `${displayHour} ${suffix}`;
  }

  function formatChartHour(hour: number) {
    if (hour === 0) return "12 AM";
    if (hour === 12) return "12 PM";
    if (hour > 12) return `${hour - 12} PM`;

    return `${hour} AM`;
  }

  function formatMonth(month: string | null) {
    if (!month) return "n/a";

    const [year, monthNumber] = month.split("-");

    const date = new Date(Number(year), Number(monthNumber) - 1);

    return date.toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });
  }

  function formatChartMonth(month: string) {
    const [year, monthNumber] = month.split("-");

    const date = new Date(Number(year), Number(monthNumber) - 1);

    return date.toLocaleString("en-US", {
      month: "short",
      year: "2-digit",
    });
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
      {/* little noise-ish background circles */}
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

          {/* UPLOAD */}
          <motion.div
            initial={{
              opacity: 0,
              rotate: 2,
              y: 25,
            }}
            animate={{
              opacity: 1,
              rotate: -1,
              y: 0,
            }}
            transition={{
              duration: 0.8,
              delay: 0.15,
            }}
            className="relative"
          >
            <div className="absolute -right-4 -top-5 rotate-6 bg-yellow-400 px-4 py-2 text-sm font-bold text-[#0b132b] shadow-xl">
              feed me the lore
            </div>

            <div className="rounded-xl border-2 border-[#344363] bg-[#131b33] p-5 shadow-2xl">
              <label
                htmlFor="chat-file"
                onDragEnter={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  setDragging(false);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragging(false);

                  selectFile(event.dataTransfer.files?.[0] ?? null);
                }}
                className={`flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-8 text-center transition ${
                  dragging
                    ? "border-yellow-400 bg-yellow-400/10"
                    : "border-[#435273] bg-[#0f172a]/60 hover:border-yellow-400"
                }`}
              >
                <input
                  id="chat-file"
                  type="file"
                  accept=".txt"
                  className="hidden"
                  onChange={(event) =>
                    selectFile(event.target.files?.[0] ?? null)
                  }
                />

                <UploadCloud size={38} className="mb-5 text-yellow-400" />

                {file ? (
                  <>
                    <p className="text-lg font-bold">{file.name}</p>

                    <p className="mt-2 text-sm text-[#7d8aa6]">
                      this should be interesting
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-bold">drop your chat here</p>

                    <p className="mt-2 text-sm text-[#7d8aa6]">
                      or click this suspiciously large box
                    </p>

                    <p className="mt-1 text-xs text-[#56627c]">
                      whatsapp or copied instagram .txt export
                    </p>
                  </>
                )}
              </label>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-[#344363] bg-[#0f172a]/50 p-4">
                  <p className="text-sm font-bold text-yellow-400">whatsapp</p>

                  <p className="mt-1 text-xs leading-5 text-[#7d8aa6]">
                    export the chat without media and upload the .txt file
                  </p>
                </div>

                <div className="rounded-lg border border-[#344363] bg-[#0f172a]/50 p-4">
                  <p className="text-sm font-bold text-yellow-400">instagram</p>

                  <p className="mt-1 text-xs leading-5 text-[#7d8aa6]">
                    open your downloaded conversation, copy the chat into a .txt
                    file, then upload it here
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={{
                  scale: 1.03,
                }}
                whileTap={{
                  scale: 0.97,
                }}
                onClick={handleAnalyze}
                disabled={loading || !file}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-400 px-6 py-4 font-bold text-[#0b132b] shadow-lg transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <LoaderCircle className="animate-spin" size={19} />
                    overanalyzing...
                  </>
                ) : (
                  <>
                    analyze my questionable decisions
                    <Sparkles size={17} />
                  </>
                )}
              </motion.button>
            </div>

            {error && (
              <p className="mt-4 rounded-lg bg-red-950/50 px-4 py-3 text-sm text-red-300">
                {error}
              </p>
            )}
          </motion.div>
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

            {/* HEAD TO HEAD */}
            <Section dark>
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
                  const behavior = data.behavior[name];

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

                        <RawStat
                          label="words"
                          value={stats.words.toLocaleString()}
                        />

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
                          value={(
                            behavior?.conversationStarts ?? 0
                          ).toLocaleString()}
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

            {/* AWARDS */}
            <Section>
              <SectionTitle
                eyebrow="the official ceremony"
                title="chat awards"
                text="prestigious. scientifically rigorous. definitely going on linkedin."
              />

              <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
                <Award
                  rotation={awardRotations[0]}
                  icon={<MessageCircleMore />}
                  title="biggest yapper"
                  winner={data.awards.biggestYapper}
                  caption="bro had things to say"
                />

                <Award
                  rotation={awardRotations[1]}
                  icon={<Zap />}
                  title="fastest responder"
                  winner={data.awards.fastestResponder}
                  caption="phone apparently surgically attached"
                />

                <Award
                  rotation={awardRotations[2]}
                  icon={<Send />}
                  title="conversation starter"
                  winner={data.awards.conversationStarter}
                  caption="keeping the friendship alive one text at a time"
                />

                <Award
                  rotation={awardRotations[3]}
                  icon={<MessagesSquare />}
                  title="double text champion"
                  winner={data.awards.doubleTexter}
                  caption="one message simply wasn't enough"
                />

                <Award
                  rotation={awardRotations[4]}
                  icon={<FileText />}
                  title="most words"
                  winner={data.awards.mostWords}
                  caption="published author apparently"
                />

                <Award
                  rotation={awardRotations[5]}
                  icon={<BrainCircuit />}
                  title="certified essay sender"
                  winner={data.awards.longestMessages}
                  caption="paragraph enjoyer"
                />
              </div>
            </Section>

            {/* ACTIVITY */}
            <Section dark>
              <SectionTitle
                eyebrow="activity"
                title="when do you people sleep?"
                text="a concerning examination of when this chat is most active."
              />

              <div className="mb-14 grid gap-8 text-center md:grid-cols-3">
                <BigFact
                  label="busiest hour"
                  value={formatHour(data.activity.busiestHour)}
                />

                <BigFact
                  label="busiest day"
                  value={data.activity.busiestDay ?? "n/a"}
                />

                <BigFact
                  label="busiest month"
                  value={formatMonth(data.activity.busiestMonth)}
                />
              </div>

              <div className="grid gap-10 lg:grid-cols-2">
                <RawChart title="messages by hour">
                  <ResponsiveContainer width="100%" height={290}>
                    <BarChart data={data.activity.messagesByHour}>
                      <CartesianGrid vertical={false} stroke="#334155" />

                      <XAxis
                        dataKey="hour"
                        tickFormatter={formatChartHour}
                        tick={chartTick}
                        axisLine={false}
                        tickLine={false}
                      />

                      <YAxis
                        tick={chartTick}
                        axisLine={false}
                        tickLine={false}
                      />

                      <Tooltip
                        contentStyle={tooltipStyle}
                        cursor={{
                          fill: "#facc1514",
                        }}
                        labelFormatter={(hour) => formatChartHour(Number(hour))}
                      />

                      <Bar
                        dataKey="messages"
                        fill="#facc15"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </RawChart>

                <RawChart title="messages by weekday">
                  <ResponsiveContainer width="100%" height={290}>
                    <BarChart data={data.activity.messagesByWeekday}>
                      <CartesianGrid vertical={false} stroke="#334155" />

                      <XAxis
                        dataKey="day"
                        tickFormatter={(day) => day.slice(0, 3)}
                        tick={chartTick}
                        axisLine={false}
                        tickLine={false}
                      />

                      <YAxis
                        tick={chartTick}
                        axisLine={false}
                        tickLine={false}
                      />

                      <Tooltip
                        contentStyle={tooltipStyle}
                        cursor={{
                          fill: "#facc1514",
                        }}
                      />

                      <Bar
                        dataKey="messages"
                        fill="#facc15"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </RawChart>
              </div>

              <div className="mt-12">
                <RawChart title="the rise and fall of the yap">
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={data.activity.messagesByMonth}>
                      <CartesianGrid vertical={false} stroke="#334155" />

                      <XAxis
                        dataKey="month"
                        tickFormatter={formatChartMonth}
                        tick={chartTick}
                        axisLine={false}
                        tickLine={false}
                      />

                      <YAxis
                        tick={chartTick}
                        axisLine={false}
                        tickLine={false}
                      />

                      <Tooltip
                        contentStyle={tooltipStyle}
                        labelFormatter={(month) => formatMonth(String(month))}
                      />

                      <Line
                        type="monotone"
                        dataKey="messages"
                        stroke="#facc15"
                        strokeWidth={4}
                        dot={{
                          r: 3,
                          fill: "#facc15",
                        }}
                        activeDot={{
                          r: 6,
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </RawChart>
              </div>
            </Section>

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
                  className="mt-3 text-7xl font-black uppercase text-yellow-400 sm:text-8xl lg:text-9xl"
                >
                  {data.aiAnalysis.funniest.person}
                </motion.h2>

                <p className="mt-3 text-3xl font-bold">
                  {data.aiAnalysis.funniest.confidence}%
                </p>

                <p className="mx-auto mt-10 max-w-3xl text-xl leading-9 text-[#d1d8e5]">
                  &ldquo;
                  {data.aiAnalysis.funniest.reason}
                  &rdquo;
                </p>

                <p className="mt-7 text-xs italic text-[#66738d]">
                  *science may be doing some heavy lifting here
                </p>
              </div>

              <div className="mx-auto mt-20 max-w-4xl border-l-4 border-yellow-400 pl-7">
                <p className="mb-4 text-sm font-bold text-yellow-400">
                  okay but what&apos;s the actual dynamic
                </p>

                <p className="text-xl leading-9 text-[#c5cddd]">
                  {data.aiAnalysis.conversationDynamic}
                </p>
              </div>
            </Section>

            {/* PERSONALITIES */}
            <Section dark>
              <SectionTitle
                eyebrow="for the character study"
                title="texting personalities"
                text="somehow a language model has opinions about both of you now."
              />

              <div className="grid gap-10 md:grid-cols-2">
                {Object.entries(data.aiAnalysis.participants).map(
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
                    >
                      <p className="mb-3 font-mono text-sm text-yellow-400">
                        {name.toLowerCase()}.txt
                      </p>

                      <div className="border-2 border-[#364564] bg-[#111a30] p-7 shadow-xl">
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
                  {data.aiAnalysis.recurringTopics.map((topic, index) => (
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
                      className="border-2 border-yellow-400 bg-[#17213b] px-4 py-2 text-sm font-semibold shadow-lg"
                    >
                      {topic}
                    </motion.span>
                  ))}
                </div>
              </div>

              <div className="mt-16 grid gap-14 lg:grid-cols-2">
                <LoreList
                  title="recurring bits that refuse to die"
                  items={data.aiAnalysis.insideJokesOrPatterns}
                />

                <LoreList
                  title="things the machine noticed"
                  items={data.aiAnalysis.interestingObservations}
                />
              </div>
            </Section>
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

function Section({
  children,
  dark = false,
}: {
  children: ReactNode;
  dark?: boolean;
}) {
  return (
    <section
      className={dark ? "border-y border-[#34415e] bg-[#0d162b]/75" : ""}
    >
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">{children}</div>
    </section>
  );
}

function YellowLabel({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rotate-[-1deg] bg-yellow-400 px-4 py-2 text-sm font-black text-[#0b132b] shadow-lg">
      {children}
    </span>
  );
}

function SectionTitle({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div className="mb-14 max-w-3xl">
      <p className="mb-3 text-sm font-bold text-yellow-400">{eyebrow}</p>

      <h2 className="text-4xl font-black sm:text-5xl">{title}</h2>

      <p className="mt-4 text-lg leading-7 text-[#8d9ab4]">{text}</p>
    </div>
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

function Award({
  rotation,
  icon,
  title,
  winner,
  caption,
}: {
  rotation: string;
  icon: ReactNode;
  title: string;
  winner: string | null;
  caption: string;
}) {
  return (
    <motion.div
      whileHover={{
        scale: 1.04,
        rotate: 0,
      }}
      className={`${rotation} border-2 border-yellow-400 bg-[#14203a] p-6 shadow-xl`}
    >
      <div className="mb-7 flex h-11 w-11 items-center justify-center rounded-full bg-yellow-400 text-[#0b132b]">
        {icon}
      </div>

      <p className="text-sm font-bold text-yellow-400">{title}</p>

      <p className="mt-2 text-3xl font-black">{winner ?? "n/a"}</p>

      <p className="mt-4 text-sm text-[#8794ad]">{caption}</p>
    </motion.div>
  );
}

function BigFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-bold text-yellow-400">{label}</p>

      <p className="mt-2 text-4xl font-black sm:text-5xl">{value}</p>
    </div>
  );
}

function RawChart({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <BarChart3 size={18} className="text-yellow-400" />

        <h3 className="text-lg font-bold">{title}</h3>
      </div>

      <div className="border-t-2 border-[#33415d] pt-6">{children}</div>
    </div>
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

      <p className="leading-7 text-[#c3ccdc]">{value}</p>
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

            <p className="leading-7 text-[#c1cadb]">{item}</p>
          </motion.div>
        ))}
      </div>
    </div>
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
