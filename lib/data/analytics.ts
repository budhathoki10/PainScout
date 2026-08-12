import { getPrisma, isDatabaseConfigured } from "@/lib/prisma";
import { computeAnalytics, mockDigestLogs } from "@/lib/mock-data";
import type { AnalyticsPoint } from "@/lib/types";

const WINDOW_DAYS = 14;

function dayBounds(daysAgo: number) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - daysAgo);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

export async function getAnalytics(projectId: string | "all", userId: string): Promise<AnalyticsPoint[]> {
  if (!isDatabaseConfigured()) return computeAnalytics(projectId);

  const { start: windowStart } = dayBounds(WINDOW_DAYS - 1);
  const leads = await getPrisma().lead.findMany({
    where: {
      project: { userId },
      ...(projectId !== "all" ? { projectId } : {}),
      createdAt: { gte: windowStart },
    },
    select: { createdAt: true, status: true },
  });

  const points: AnalyticsPoint[] = [];
  for (let i = WINDOW_DAYS - 1; i >= 0; i--) {
    const { start, end } = dayBounds(i);
    const dayLeads = leads.filter((l) => l.createdAt >= start && l.createdAt < end);
    points.push({
      date: start.toISOString().slice(0, 10),
      matches: dayLeads.length,
      useful: dayLeads.filter((l) => l.status === "USEFUL" || l.status === "CONTACTED").length,
      notRelevant: dayLeads.filter((l) => l.status === "NOT_RELEVANT").length,
    });
  }
  return points;
}

export async function getOpenRate(projectId: string | "all", userId: string): Promise<number> {
  if (!isDatabaseConfigured()) {
    const logs =
      projectId === "all" ? Object.values(mockDigestLogs).flat() : mockDigestLogs[projectId] ?? [];
    if (logs.length === 0) return 0;
    return Math.round((logs.filter((l) => l.opened).length / logs.length) * 100);
  }

  const logs = await getPrisma().digestLog.findMany({
    where: { project: { userId }, ...(projectId !== "all" ? { projectId } : {}) },
    select: { opened: true },
  });
  if (logs.length === 0) return 0;
  return Math.round((logs.filter((l) => l.opened).length / logs.length) * 100);
}

export interface DigestTrendPoint {
  date: string;
  leadCount: number;
  opened: number; // 0 or 1 for a single project, fraction opened for "all"
}

export async function getDigestTrend(projectId: string | "all", userId: string): Promise<DigestTrendPoint[]> {
  if (!isDatabaseConfigured()) {
    if (projectId !== "all") {
      return (mockDigestLogs[projectId] ?? []).map((l) => ({
        date: l.sentAt.slice(0, 10),
        leadCount: l.leadCount,
        opened: l.opened ? 1 : 0,
      }));
    }
    const byDate = new Map<string, { leadCount: number; opened: number; total: number }>();
    for (const logs of Object.values(mockDigestLogs)) {
      for (const l of logs) {
        const date = l.sentAt.slice(0, 10);
        const entry = byDate.get(date) ?? { leadCount: 0, opened: 0, total: 0 };
        entry.leadCount += l.leadCount;
        entry.opened += l.opened ? 1 : 0;
        entry.total += 1;
        byDate.set(date, entry);
      }
    }
    return Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({ date, leadCount: v.leadCount, opened: v.total ? v.opened / v.total : 0 }));
  }

  const logs = await getPrisma().digestLog.findMany({
    where: { project: { userId }, ...(projectId !== "all" ? { projectId } : {}) },
    select: { sentAt: true, leadCount: true, opened: true },
    orderBy: { sentAt: "asc" },
  });

  const byDate = new Map<string, { leadCount: number; opened: number; total: number }>();
  for (const log of logs) {
    const date = log.sentAt.toISOString().slice(0, 10);
    const entry = byDate.get(date) ?? { leadCount: 0, opened: 0, total: 0 };
    entry.leadCount += log.leadCount;
    entry.opened += log.opened ? 1 : 0;
    entry.total += 1;
    byDate.set(date, entry);
  }
  return Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({ date, leadCount: v.leadCount, opened: v.total ? v.opened / v.total : 0 }));
}
