"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartTooltip } from "@/components/analytics/chart-tooltip";

interface AccuracyDonutProps {
  useful: number;
  notRelevant: number;
  unreviewed: number;
}

export function AccuracyDonut({ useful, notRelevant, unreviewed }: AccuracyDonutProps) {
  const data = [
    { name: "Useful", value: useful, color: "var(--chart-1)" },
    { name: "Not relevant", value: notRelevant, color: "var(--chart-4)" },
    { name: "Unreviewed", value: unreviewed, color: "var(--chart-5)" },
  ].filter((d) => d.value > 0);

  const total = useful + notRelevant + unreviewed;
  const accuracy = total > 0 ? Math.round((useful / (useful + notRelevant || 1)) * 100) : 0;

  if (total === 0) {
    return (
      <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
        No feedback yet
      </div>
    );
  }

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Tooltip content={<ChartTooltip />} />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={2}
            strokeWidth={0}
          >
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold tracking-tight">{accuracy}%</span>
        <span className="text-xs text-muted-foreground">marked useful</span>
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-2 rounded-full" style={{ backgroundColor: d.color }} />
            {d.name} ({d.value})
          </div>
        ))}
      </div>
    </div>
  );
}
