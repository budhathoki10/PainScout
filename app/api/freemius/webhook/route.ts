import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getPrisma, isDatabaseConfigured } from "@/lib/prisma";
import { getFreemiusSecretKey } from "@/lib/freemius";

export const dynamic = "force-dynamic";

// Freemius signs each webhook payload with your product's secret key
// (HMAC-SHA256 over the raw body, hex-encoded, sent in the X-Signature header).
// Verify the exact header name/algorithm against your product's webhook logs
// in the Freemius dashboard before relying on this in production.
function isValidSignature(rawBody: string, signatureHeader: string | null, secretKey: string): boolean {
  if (!signatureHeader) return false;
  const expected = createHmac("sha256", secretKey).update(rawBody).digest("hex");
  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(signatureHeader);
  if (expectedBuf.length !== actualBuf.length) return false;
  return timingSafeEqual(expectedBuf, actualBuf);
}

export async function POST(req: NextRequest) {
  let secretKey: string;
  try {
    secretKey = getFreemiusSecretKey();
  } catch {
    return NextResponse.json({ error: "FREEMIUS_SECRET_KEY is not configured on the server." }, { status: 500 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-signature");
  if (!isValidSignature(rawBody, signature, secretKey)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "DATABASE_URL is not configured on the server." }, { status: 500 });
  }

  const event = JSON.parse(rawBody);
  const eventType: string = event.type ?? "";
  const subscription = event.objects?.subscription;
  const license = event.objects?.license;
  const buyerEmail: string | undefined = event.objects?.user?.email;

  if (!buyerEmail) {
    // Nothing to reconcile against — acknowledge so Freemius doesn't retry.
    return NextResponse.json({ received: true });
  }

  const prisma = getPrisma();
  const user = await prisma.user.findUnique({ where: { email: buyerEmail } });
  if (!user) {
    return NextResponse.json({ received: true });
  }

  if (
    eventType.startsWith("subscription.created") ||
    eventType.startsWith("subscription.renewed") ||
    eventType.startsWith("subscription.plan.changed") ||
    eventType.startsWith("license.created") ||
    eventType.startsWith("payment.completed")
  ) {
    await prisma.subscription.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        plan: "PRO",
        status: "ACTIVE",
        freemiusUserId: String(event.objects?.user?.id ?? ""),
        freemiusSubscriptionId: String(subscription?.id ?? license?.id ?? ""),
        currentPeriodEnd: subscription?.next_payment ? new Date(subscription.next_payment) : null,
      },
      update: {
        plan: "PRO",
        status: "ACTIVE",
        freemiusUserId: String(event.objects?.user?.id ?? ""),
        freemiusSubscriptionId: String(subscription?.id ?? license?.id ?? ""),
        currentPeriodEnd: subscription?.next_payment ? new Date(subscription.next_payment) : null,
      },
    });
  } else if (
    eventType.startsWith("subscription.cancelled") ||
    eventType.startsWith("subscription.expired") ||
    eventType.startsWith("license.cancelled")
  ) {
    await prisma.subscription.updateMany({
      where: { userId: user.id },
      data: { plan: "FREE", status: "CANCELED" },
    });
  }

  return NextResponse.json({ received: true });
}
