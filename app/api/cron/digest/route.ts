import { NextRequest, NextResponse } from "next/server";
import { getPrisma, isDatabaseConfigured } from "@/lib/prisma";
import { scanProjectForLeads } from "@/lib/scan";
import { sendDigestEmail } from "@/lib/email";
import { PLAN_LIMITS, getUserPlan } from "@/lib/entitlements";

export const dynamic = "force-dynamic";

/** Hour (0-23) it currently is in the given IANA timezone. */
function currentHourIn(timeZone: string): number {
  const hourStr = new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", hour12: false }).format(
    new Date(),
  );
  // "24" is midnight in some locales' hour12:false output — normalize to 0.
  return Number(hourStr) % 24;
}

/**
 * A project's target delivery hours, in its owner's timezone. Twice-daily is
 * a Pro feature — `allowTwiceDaily` re-checks the owner's *current* plan so
 * a project set to TWICE_DAILY while on Pro correctly falls back to once a
 * day if the owner later downgrades, even though the stored field doesn't
 * change until they touch project settings again.
 */
function deliveryHoursFor(project: { deliveryHour: number; frequency: string }, allowTwiceDaily: boolean): number[] {
  return project.frequency === "TWICE_DAILY" && allowTwiceDaily
    ? [project.deliveryHour, (project.deliveryHour + 12) % 24]
    : [project.deliveryHour];
}

const RECENT_SEND_GUARD_MS = 55 * 60 * 1000;

// The dashboard shows every fresh lead; the email is a quick daily glance,
// so it only gets the top-scoring ones (freshLeads is already score-sorted).
const MAX_EMAIL_LEADS = 2;

/**
 * Full production pipeline (spec Section 5-7): dedupe against stored
 * postUris -> pain filter -> rank -> persist -> email.
 *
 * Triggered by an external scheduler (cron-job.org) calling this route with
 * `Authorization: Bearer $CRON_SECRET` — expected to fire at least once an
 * hour so this route's own timezone/deliveryHour gating can decide which
 * projects are actually due. Pass `?force=true` to bypass the gate (still
 * requires the same auth) for manual testing. Requires DATABASE_URL,
 * BLUESKY_HANDLE/BLUESKY_APP_PASSWORD, and RESEND_API_KEY to actually run —
 * the demo UI never calls this route, it reads lib/mock-data.ts instead.
 */
export async function POST(req: NextRequest) {
  console.log("_______________________________________")
  console.log("got the cron digest request0000")
  console.log("_______________________________________")

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

  const force = req.nextUrl.searchParams.get("force") === "true";

  const prisma = getPrisma();
  const projects = await prisma.project.findMany({
    where: { paused: false },
    include: { user: true },
  });

  const results = [];

  for (const project of projects) {
    try {
      if (!force) {
        const plan = await getUserPlan(project.userId);
        const allowTwiceDaily = PLAN_LIMITS[plan].scansPerDay >= 2;

        const currentHour = currentHourIn(project.user.timezone);
        if (!deliveryHoursFor(project, allowTwiceDaily).includes(currentHour)) {
          results.push({ project: project.name, scheduled: false, reason: "not this project's delivery hour" });
          continue;
        }

        const recentLog = await prisma.digestLog.findFirst({
          where: { projectId: project.id },
          orderBy: { sentAt: "desc" },
        });
        if (recentLog && Date.now() - recentLog.sentAt.getTime() < RECENT_SEND_GUARD_MS) {
          results.push({ project: project.name, scheduled: false, reason: "already ran this delivery window" });
          continue;
        }
      }

      const freshLeads = await scanProjectForLeads(project);

      if (freshLeads.length === 0) {
        results.push({ project: project.name, sent: false, newLeads: 0 });
        continue;
      }

      if (project.user.emailDigestOn) {
        await sendDigestEmail({
          to: project.user.email,
          projectName: project.name,
          leads: freshLeads.slice(0, MAX_EMAIL_LEADS),
          totalCount: freshLeads.length,
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
