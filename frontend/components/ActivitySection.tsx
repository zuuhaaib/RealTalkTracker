"use client";

import type { ReactNode } from "react";
import { BarChart3 } from "lucide-react";
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
import type { ActivityStats } from "../types/analysis";
import { Section, SectionTitle } from "./ui";

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

export default function ActivitySection({
  activity,
}: {
  activity: ActivityStats;
}) {
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

  return (
    <Section dark>
      <SectionTitle
        eyebrow="activity"
        title="when do you people sleep?"
        text="a concerning examination of when this chat is most active."
      />

      <div className="mb-14 grid gap-8 text-center md:grid-cols-3">
        <BigFact
          label="busiest hour"
          value={formatHour(activity.busiestHour)}
        />

        <BigFact label="busiest day" value={activity.busiestDay ?? "n/a"} />

        <BigFact
          label="busiest month"
          value={formatMonth(activity.busiestMonth)}
        />
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <RawChart title="messages by hour">
          <ResponsiveContainer width="100%" height={290}>
            <BarChart data={activity.messagesByHour}>
              <CartesianGrid vertical={false} stroke="#334155" />

              <XAxis
                dataKey="hour"
                tickFormatter={formatChartHour}
                tick={chartTick}
                axisLine={false}
                tickLine={false}
              />

              <YAxis tick={chartTick} axisLine={false} tickLine={false} />

              <Tooltip
                contentStyle={tooltipStyle}
                cursor={{
                  fill: "#facc1514",
                }}
                labelFormatter={(hour) => formatChartHour(Number(hour))}
              />

              <Bar dataKey="messages" fill="#facc15" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </RawChart>

        <RawChart title="messages by weekday">
          <ResponsiveContainer width="100%" height={290}>
            <BarChart data={activity.messagesByWeekday}>
              <CartesianGrid vertical={false} stroke="#334155" />

              <XAxis
                dataKey="day"
                tickFormatter={(day) => day.slice(0, 3)}
                tick={chartTick}
                axisLine={false}
                tickLine={false}
              />

              <YAxis tick={chartTick} axisLine={false} tickLine={false} />

              <Tooltip
                contentStyle={tooltipStyle}
                cursor={{
                  fill: "#facc1514",
                }}
              />

              <Bar dataKey="messages" fill="#facc15" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </RawChart>
      </div>

      <div className="mt-12">
        <RawChart title="the rise and fall of the yap">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={activity.messagesByMonth}>
              <CartesianGrid vertical={false} stroke="#334155" />

              <XAxis
                dataKey="month"
                tickFormatter={formatChartMonth}
                tick={chartTick}
                axisLine={false}
                tickLine={false}
              />

              <YAxis tick={chartTick} axisLine={false} tickLine={false} />

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
