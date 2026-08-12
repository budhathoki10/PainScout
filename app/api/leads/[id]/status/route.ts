import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPrisma, isDatabaseConfigured } from "@/lib/prisma";
import type { LeadStatus } from "@/lib/types";

const VALID_STATUSES: LeadStatus[] = ["NEW", "USEFUL", "NOT_RELEVANT", "CONTACTED"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const status = body?.status as LeadStatus | undefined;
  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  if (!isDatabaseConfigured()) {
    // Demo mode: no persistence layer, the dashboard updates its own local
    // state optimistically. Acknowledge so the client's toast/UI stays honest.
    return NextResponse.json({ ok: true, id, status, persisted: false });
  }

  const prisma = getPrisma();
  // Scoped through the project relation so a user can never update a lead
  // that isn't theirs, even by guessing/enumerating another lead's id.
  const result = await prisma.lead.updateMany({
    where: { id, project: { userId: session.user.id } },
    data: { status },
  });
  if (result.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, id, status, persisted: true });
}
