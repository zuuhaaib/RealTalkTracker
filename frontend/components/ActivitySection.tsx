"use client";

import type { ReactNode } from "react";
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { ActivityStats } from "../types/analysis";
import { formatHour, formatMonth } from "../lib/format";
import { SectionHeading, stagger } from "./ui";

const ink = "#141413";
const accent = "#f2783c";

const chartTick = { fill: "#5f5e5a", fontSize: 14 };

const tooltipStyle = { backgroundColor: ink, border: "none", borderRadius: 12, color: "#f8f7f4" };
const tooltipLabel = { color: "#f8f7f4", fontWeight: 600 };
const tooltipItem = { color: "#f8f7f4" };

function formatChartMonth(month: string) {
  const [year, monthNumber] = month.split("-");
  const date = new Date(Number(year), Number(monthNumber) - 1);

  return date.toLocaleString("en-US", { month: "short", year: "2-digit" }).toLowerCase();
}

// When the chat happens: one sentence, then three small charts.
export default function ActivitySection({ activity }: { activity: ActivityStats }) {
  const lateNight = activity.busiestHour !== null && activity.busiestHour < 5;

  return (
    <section aria-labelledby="activity-title">
      <SectionHeading
        id="activity-title"
        title="when it happens."
        intro={lateNight ? "you should all be asleep, frankly." : "a concerning look at your schedules."}
      />

      <p data-reveal className="say text-[clamp(1.6rem,1.2rem+1.6vw,2.5rem)]">
        busiest at <span className="text-accent-text">{formatHour(activity.busiestHour)}</span>, on{" "}
        <span className="text-accent-text">{activity.busiestDay ? `${activity.busiestDay.toLowerCase()}s` : "no day in particular"}</span>
        , in <span className="text-accent-text">{formatMonth(activity.busiestMonth)}</span>.
      </p>

      <div className="mt-12 grid gap-10 sm:grid-cols-2">
        <Chart title="by hour" index={0}>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={activity.messagesByHour} margin={{ left: -20, right: 4 }}>
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
                labelStyle={tooltipLabel}
                itemStyle={tooltipItem}
                cursor={{ fill: "#14141310" }}
                labelFormatter={(hour) => formatHour(Number(hour))}
              />
              <Bar dataKey="messages" fill={ink} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Chart>

        <Chart title="by day" index={1}>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={activity.messagesByWeekday} margin={{ left: -20, right: 4 }}>
              <XAxis
                dataKey="day"
                tickFormatter={(day) => day.slice(0, 3).toLowerCase()}
                tick={chartTick}
                axisLine={false}
                tickLine={false}
                interval={0}
              />
              <YAxis allowDecimals={false} tick={chartTick} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={tooltipLabel}
                itemStyle={tooltipItem}
                cursor={{ fill: "#14141310" }}
              />
              <Bar dataKey="messages" fill={accent} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Chart>
      </div>

      <div className="mt-10">
        <Chart title="the rise and fall of the yap" index={0}>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={activity.messagesByMonth} margin={{ left: -20, right: 12 }}>
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
                labelStyle={tooltipLabel}
                itemStyle={tooltipItem}
                labelFormatter={(month) => formatMonth(String(month))}
              />
              <Line type="linear" dataKey="messages" stroke={ink} strokeWidth={3} dot={false} activeDot={{ r: 5, fill: accent }} />
            </LineChart>
          </ResponsiveContainer>
        </Chart>
      </div>
    </section>
  );
}

function Chart({ title, index, children }: { title: string; index: number; children: ReactNode }) {
  return (
    <figure data-reveal style={stagger(index)} className="min-w-0">
      <figcaption className="mb-3 text-lg font-semibold">{title}</figcaption>
      {children}
    </figure>
  );
}
