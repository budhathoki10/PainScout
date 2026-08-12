import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPrisma, isDatabaseConfigured } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const keywords = Array.isArray(body?.keywords)
    ? body.keywords.filter((k: unknown): k is string => typeof k === "string" && k.trim().length > 0)
    : [];

  if (!name) {
    return NextResponse.json({ error: "Project name is required" }, { status: 400 });
  }
  if (keywords.length === 0) {
    return NextResponse.json({ error: "At least one keyword is required" }, { status: 400 });
  }

  if (!isDatabaseConfigured()) {
    // Demo mode: nothing to persist to — acknowledge so the wizard's success
    // screen stays honest about what actually happened.
    return NextResponse.json({ ok: true, persisted: false });
  }

  const prisma = getPrisma();
  const project = await prisma.project.create({
    data: { userId: session.user.id, name, keywords },
  });

  return NextResponse.json({ ok: true, persisted: true, project: { id: project.id, name: project.name } });
}
