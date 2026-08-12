import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPrisma, isDatabaseConfigured } from "@/lib/prisma";
import { scanProjectForLeads } from "@/lib/scan";

/**
 * User-triggered "Scrape now" — runs the same live Bluesky search/filter/
 * dedupe pipeline as the scheduled cron digest, but never emails. Only the
 * scheduled cron run (app/api/cron/digest/route.ts) sends the digest email
 * and logs a DigestLog entry; a manual scrape just refreshes the dashboard.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "DATABASE_URL is not configured on the server." }, { status: 500 });
  }

  const prisma = getPrisma();
  const project = await prisma.project.findFirst({ where: { id, userId: session.user.id } });
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const freshLeads = await scanProjectForLeads(project);
    return NextResponse.json({ ok: true, newLeads: freshLeads.length });
  } catch (err) {
    console.error(`[projects/${id}/scan] failed:`, err);
    return NextResponse.json({ error: "Scrape failed. Please try again." }, { status: 502 });
  }
}
