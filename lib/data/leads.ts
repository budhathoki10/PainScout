import { getPrisma, isDatabaseConfigured } from "@/lib/prisma";
import { mockDigestLogs, mockLeads } from "@/lib/mock-data";
import type { DigestLogEntry, Lead, LeadStatus } from "@/lib/types";
import type { DigestLog as PrismaDigestLog, Lead as PrismaLead } from "@prisma/client";

export interface LeadFilters {
  userId: string;
  projectId?: string;
  status?: LeadStatus | "ALL";
  sort?: "recent" | "score";
}

function toLead(row: PrismaLead): Lead {
  return {
    id: row.id,
    projectId: row.projectId,
    redditId: row.redditId,
    subreddit: row.subreddit,
    title: row.title,
    snippet: row.snippet,
    url: row.url,
    author: row.author,
    score: row.score,
    status: row.status,
    matchedOn: row.matchedOn,
    createdAt: row.createdAt.toISOString(),
  };
}

function toDigestLog(row: PrismaDigestLog): DigestLogEntry {
  return {
    id: row.id,
    projectId: row.projectId,
    sentAt: row.sentAt.toISOString(),
    leadCount: row.leadCount,
    opened: row.opened,
  };
}

export async function getLeads(filters: LeadFilters): Promise<Lead[]> {
  if (!isDatabaseConfigured()) {
    let leads = [...mockLeads];
    if (filters.projectId) leads = leads.filter((l) => l.projectId === filters.projectId);
    if (filters.status && filters.status !== "ALL") leads = leads.filter((l) => l.status === filters.status);
    leads.sort((a, b) =>
      filters.sort === "score"
        ? b.score - a.score
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return leads;
  }

  // Scoped via the project relation so a lead can never be returned unless
  // its project actually belongs to the requesting user.
  const rows = await getPrisma().lead.findMany({
    where: {
      project: { userId: filters.userId },
      ...(filters.projectId ? { projectId: filters.projectId } : {}),
      ...(filters.status && filters.status !== "ALL" ? { status: filters.status } : {}),
    },
    orderBy: filters.sort === "score" ? { score: "desc" } : { createdAt: "desc" },
  });
  return rows.map(toLead);
}

export async function getDigestLogs(projectId: string, userId: string): Promise<DigestLogEntry[]> {
  if (!isDatabaseConfigured()) return mockDigestLogs[projectId] ?? [];
  const rows = await getPrisma().digestLog.findMany({
    where: { projectId, project: { userId } },
    orderBy: { sentAt: "asc" },
  });
  return rows.map(toDigestLog);
}
