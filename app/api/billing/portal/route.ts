import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { buildPortalUrl } from "@/lib/billing-freemius";
import { isFreemiusConfigured } from "@/lib/freemius";

export const dynamic = "force-dynamic";

function appUrl(path: string): string {
  return `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}${path}`;
}

/**
 * Redirects the signed-in user to Freemius's hosted customer portal (manage
 * payment method, view invoices, cancel). Minted on click since the link is
 * short-lived; nothing about it is stored.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.email || !session.user.id) {
    return NextResponse.redirect(appUrl("/login?callbackUrl=/api/billing/portal"));
  }

  if (!isFreemiusConfigured()) {
    return NextResponse.redirect(appUrl("/billing?error=portal_unavailable"));
  }

  const portalUrl = await buildPortalUrl({ userId: session.user.id, email: session.user.email });

  if (!portalUrl) {
    return NextResponse.redirect(appUrl("/billing?error=portal_unavailable"));
  }

  return NextResponse.redirect(portalUrl);
}
