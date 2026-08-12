import { NextRequest, NextResponse } from "next/server";
import { getPrisma, isDatabaseConfigured } from "@/lib/prisma";
import { searchMultipleKeywords } from "@/lib/bluesky";
import { filterPosts } from "@/lib/filter";
import { rankForDigest } from "@/lib/digest";
import { sendDigestEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

/**
 * Full production pipeline (spec Section 5-7): dedupe against stored
 * postUris -> pain filter -> rank -> persist -> email.
 *
 * Triggered daily by an external scheduler (cron-job.org) calling this route
 * with `Authorization: Bearer $CRON_SECRET`. Requires DATABASE_URL,
 * BLUESKY_HANDLE/BLUESKY_APP_PASSWORD, and RESEND_API_KEY to actually run —
 * the demo UI never calls this route, it reads lib/mock-data.ts instead.
 */
export async function POST(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured on the server." }, { status: 500 });
  }
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "DATABASE_URL is not configured on the server." }, { status: 500 });
  }

  const prisma = getPrisma();
  const projects = await prisma.project.findMany({
    where: { paused: false },
    include: { user: true },
  });

  const results = [];

  for (const project of projects) {
    try {
      const posts = await searchMultipleKeywords(project.keywords);
      const scored = filterPosts(posts, project.keywords);
      const ranked = rankForDigest(scored);

      const existingUris = new Set(
        (
          await prisma.lead.findMany({
            where: { projectId: project.id, postUri: { in: ranked.map((l) => l.postUri) } },
            select: { postUri: true },
          })
        ).map((l) => l.postUri),
      );
      const freshLeads = ranked.filter((l) => !existingUris.has(l.postUri));

      if (freshLeads.length === 0) {
        results.push({ project: project.name, sent: false, newLeads: 0 });
        continue;
      }

      await prisma.lead.createMany({
        data: freshLeads.map((l) => ({
          projectId: project.id,
          postUri: l.postUri,
          authorHandle: l.authorHandle,
          text: l.text,
          url: l.url,
          score: l.score,
          matchedOn: l.matchedOn,
        })),
      });

      if (project.user.emailDigestOn) {
        await sendDigestEmail({
          to: project.user.email,
          projectName: project.name,
          leads: freshLeads,
          dashboardUrl: `${process.env.NEXTAUTH_URL ?? "https://example.com"}/dashboard`,
        });
      }

      await prisma.digestLog.create({
        data: { projectId: project.id, leadCount: freshLeads.length, opened: false },
      });

      results.push({ project: project.name, sent: project.user.emailDigestOn, newLeads: freshLeads.length });
    } catch (err) {
      console.error(`[cron/digest] failed for project ${project.id}:`, err);
      results.push({ project: project.name, error: String(err) });
    }
  }

  return NextResponse.json({ ok: true, results });
}
