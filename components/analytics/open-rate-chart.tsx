"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format, parseISO } from "date-fns";
import type { DigestTrendPoint } from "@/lib/data/analytics";
import { ChartTooltip } from "@/components/analytics/chart-tooltip";

export function OpenRateChart({ data }: { data: DigestTrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis
          dataKey="date"
          tickFormatter={(d) => format(parseISO(d), "MMM d")}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          minTickGap={24}
        />
        <YAxis
          domain={[0, 1]}
          tickFormatter={(v) => `${Math.round(v * 100)}%`}
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          width={36}
        />
        <Tooltip
          content={
            <ChartTooltip
              labelFormatter={(d) => format(parseISO(String(d)), "MMM d, yyyy")}
              valueFormatter={(v) => `${Math.round(Number(v) * 100)}% opened`}
            />
          }
        />
        <Bar dataKey="opened" name="Open rate" fill="var(--chart-2)" radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}
