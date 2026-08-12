import { getPrisma, isDatabaseConfigured } from "@/lib/prisma";
import { mockProjects } from "@/lib/mock-data";
import type { Project } from "@/lib/types";
import type { Project as PrismaProject } from "@prisma/client";

/**
 * Data-access layer: reads mock data when no DATABASE_URL is set, real
 * Prisma-backed MongoDB data once it is. Every lookup is scoped to the
 * requesting user's id — a project (or its leads/settings) belonging to
 * another user is never returned, even if its id is guessed.
 */

function toProject(row: PrismaProject): Project {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    keywords: row.keywords,
    frequency: row.frequency,
    deliveryHour: row.deliveryHour,
    paused: row.paused,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function getProjects(userId: string): Promise<Project[]> {
  if (!isDatabaseConfigured()) return mockProjects;
  const rows = await getPrisma().project.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
  return rows.map(toProject);
}

export async function getProjectById(id: string, userId: string): Promise<Project | null> {
  if (!isDatabaseConfigured()) return mockProjects.find((p) => p.id === id) ?? null;
  try {
    const row = await getPrisma().project.findFirst({ where: { id, userId } });
    return row ? toProject(row) : null;
  } catch {
    // Malformed ObjectId (e.g. a stale mock-style id) — treat as not found.
    return null;
  }
}
