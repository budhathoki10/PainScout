import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPrisma, isDatabaseConfigured } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const timezone = typeof body?.timezone === "string" ? body.timezone.trim() : "";
  const emailDigestOn = typeof body?.emailDigestOn === "boolean" ? body.emailDigestOn : undefined;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!timezone) {
    return NextResponse.json({ error: "Timezone is required" }, { status: 400 });
  }
  if (emailDigestOn === undefined) {
    return NextResponse.json({ error: "emailDigestOn is required" }, { status: 400 });
  }

  if (!isDatabaseConfigured()) {
    // Demo mode: nothing to persist to — acknowledge so the form's success
    // toast stays honest about what actually happened.
    return NextResponse.json({ ok: true, persisted: false });
  }

  const prisma = getPrisma();
  await prisma.user.update({
    where: { id: session.user.id },
    data: { name, timezone, emailDigestOn },
  });

  return NextResponse.json({ ok: true, persisted: true });
}
