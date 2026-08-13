import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPrisma, isDatabaseConfigured } from "@/lib/prisma";
import { PLAN_LIMITS, getUserPlan } from "@/lib/entitlements";

const VALID_FREQUENCIES = ["DAILY", "TWICE_DAILY"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const keywords = Array.isArray(body?.keywords)
    ? body.keywords.filter((k: unknown): k is string => typeof k === "string" && k.trim().length > 0)
    : [];
  const frequency = typeof body?.frequency === "string" ? body.frequency : "";
  const deliveryHour = Number(body?.deliveryHour);
  const paused = typeof body?.paused === "boolean" ? body.paused : undefined;

  if (!name) return NextResponse.json({ error: "Project name is required" }, { status: 400 });
  if (keywords.length === 0) return NextResponse.json({ error: "At least one keyword is required" }, { status: 400 });
  if (!VALID_FREQUENCIES.includes(frequency)) {
    return NextResponse.json({ error: "Invalid frequency" }, { status: 400 });
  }
  if (!Number.isInteger(deliveryHour) || deliveryHour < 0 || deliveryHour > 23) {
    return NextResponse.json({ error: "deliveryHour must be an integer between 0 and 23" }, { status: 400 });
  }
  if (paused === undefined) {
    return NextResponse.json({ error: "paused is required" }, { status: 400 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ ok: true, persisted: false });
  }

  const plan = await getUserPlan(session.user.id);
  const limits = PLAN_LIMITS[plan];

  if (keywords.length > limits.keywordsPerProject) {
    return NextResponse.json(
      { error: `Free plan allows up to ${limits.keywordsPerProject} keywords per project. Upgrade to Pro for more.` },
      { status: 403 },
    );
  }
  if (frequency === "TWICE_DAILY" && limits.scansPerDay < 2) {
    return NextResponse.json(
      { error: "Twice-daily digests are a Pro feature. Upgrade to Pro to enable this." },
      { status: 403 },
    );
  }

  const prisma = getPrisma();
  // Scoped so a user can never update a project that isn't theirs.
  const result = await prisma.project.updateMany({
    where: { id, userId: session.user.id },
    data: { name, keywords, frequency, deliveryHour, paused },
  });
  if (result.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, persisted: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ ok: true, persisted: false });
  }

  const prisma = getPrisma();
  const project = await prisma.project.findFirst({ where: { id, userId: session.user.id } });
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.lead.deleteMany({ where: { projectId: id } });
  await prisma.digestLog.deleteMany({ where: { projectId: id } });
  await prisma.project.delete({ where: { id } });

  return NextResponse.json({ ok: true, persisted: true });
}
