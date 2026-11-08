"use client";

import type { ReactNode } from "react";
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
import { SectionHeading } from "./ui";

const accent = "#2f5d3a";

const chartTick = {
  fill: "#5d584c",
  fontSize: 12,
};

const gridStroke = "#e3dbcb";

const tooltipStyle = {
  backgroundColor: "#fbf8f1",
  border: "1px solid #dcd3c1",
  borderRadius: "10px",
  color: "#1d1b16",
};

function formatHour(hour: number | null) {
  if (hour === null) return "n/a";

  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;

  return `${displayHour} ${suffix}`;
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

export default function ActivitySection({
  activity,
}: {
  activity: ActivityStats;
}) {
  return (
    <section aria-labelledby="activity-title">
      <SectionHeading
        id="activity-title"
        title="when do you people sleep?"
        intro="a concerning examination of when this chat is most active."
      />

      <dl className="card grid divide-line sm:grid-cols-3 sm:divide-x">
        <BigFact label="busiest hour" value={formatHour(activity.busiestHour)} />
        <BigFact label="busiest day" value={activity.busiestDay ?? "n/a"} />
        <BigFact label="busiest month" value={formatMonth(activity.busiestMonth)} />
      </dl>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ChartCard title="messages by hour">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={activity.messagesByHour} margin={{ left: -16, right: 4 }}>
              <CartesianGrid vertical={false} stroke={gridStroke} />
              <XAxis
                dataKey="hour"
                ticks={[0, 6, 12, 18]}
                tickFormatter={(hour) => formatHour(Number(hour))}
                tick={chartTick}
                axisLine={false}
                tickLine={false}
              />
              <YAxis allowDecimals={false} tick={chartTick} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={tooltipStyle}
                cursor={{ fill: "#2f5d3a14" }}
                labelFormatter={(hour) => formatHour(Number(hour))}
              />
              <Bar dataKey="messages" fill={accent} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="messages by weekday">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={activity.messagesByWeekday} margin={{ left: -16, right: 4 }}>
              <CartesianGrid vertical={false} stroke={gridStroke} />
              <XAxis
                dataKey="day"
                tickFormatter={(day) => day.slice(0, 3)}
                tick={chartTick}
                axisLine={false}
                tickLine={false}
                interval={0}
              />
              <YAxis allowDecimals={false} tick={chartTick} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#2f5d3a14" }} />
              <Bar dataKey="messages" fill={accent} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="mt-4">
        <ChartCard title="the rise and fall of the yap">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={activity.messagesByMonth} margin={{ left: -16, right: 12 }}>
              <CartesianGrid vertical={false} stroke={gridStroke} />
              <XAxis
                dataKey="month"
                tickFormatter={formatChartMonth}
                tick={chartTick}
                axisLine={false}
                tickLine={false}
                // Even label steps, at most about seven labels.
                interval={Math.max(0, Math.ceil(activity.messagesByMonth.length / 7) - 1)}
              />
              <YAxis allowDecimals={false} tick={chartTick} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={tooltipStyle}
                labelFormatter={(month) => formatMonth(String(month))}
              />
              <Line
                type="linear"
                dataKey="messages"
                stroke={accent}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </section>
  );
}

function BigFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border-line px-5 py-5 not-first:border-t sm:not-first:border-t-0 sm:px-6">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="mt-1 font-display text-2xl font-semibold tracking-tight [overflow-wrap:anywhere] sm:text-3xl">
        {value}
      </dd>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <figure className="card min-w-0 p-5 sm:p-6">
      <figcaption className="mb-4 font-semibold">{title}</figcaption>
      {children}
    </figure>
  );
}
