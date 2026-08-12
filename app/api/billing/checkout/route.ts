import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPrisma, isDatabaseConfigured } from "@/lib/prisma";
import { buildCheckoutUrl } from "@/lib/billing-freemius";
import { isSubscriptionCurrentlyActive } from "@/lib/entitlements";
import { isFreemiusConfigured } from "@/lib/freemius";

export const dynamic = "force-dynamic";

function appUrl(path: string): string {
  return `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}${path}`;
}

/**
 * Redirects the signed-in user straight to a Freemius-hosted checkout link
 * for this product's one Pro plan, built server-side via the SDK (not a
 * client-editable query string). If they already have an active license,
 * it's passed through so the checkout authorizes as an upgrade against it
 * instead of starting an unrelated second subscription.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.redirect(appUrl("/login?callbackUrl=/api/billing/checkout"));
  }

  if (!isFreemiusConfigured()) {
    return NextResponse.redirect(appUrl("/billing?error=checkout_unavailable"));
  }

  let existingLicenseId: string | null = null;
  if (isDatabaseConfigured()) {
    const subscription = await getPrisma().subscription.findUnique({
      where: { userId: session.user.id },
      select: { fsLicenseId: true, status: true, currentPeriodEnd: true },
    });
    if (subscription && isSubscriptionCurrentlyActive(subscription)) {
      existingLicenseId = subscription.fsLicenseId;
    }
  }

  const checkoutUrl = await buildCheckoutUrl({
    email: session.user.email,
    name: session.user.name,
    existingLicenseId,
  });

  if (!checkoutUrl) {
    return NextResponse.redirect(appUrl("/billing?error=checkout_unavailable"));
  }

  return NextResponse.redirect(checkoutUrl);
}
