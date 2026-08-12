import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStripeClient, PRO_PLAN_PRICE_ID } from "@/lib/stripe";

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!PRO_PLAN_PRICE_ID) {
    return NextResponse.json(
      { error: "STRIPE_PRO_PRICE_ID is not configured on the server." },
      { status: 500 },
    );
  }

  const stripe = getStripeClient();
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: session.user.email ?? undefined,
    line_items: [{ price: PRO_PLAN_PRICE_ID, quantity: 1 }],
    success_url: `${baseUrl}/billing?upgraded=1`,
    cancel_url: `${baseUrl}/billing`,
    metadata: { userId: session.user.id },
  });

  return NextResponse.json({ url: checkout.url });
}
