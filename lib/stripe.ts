import Stripe from "stripe";

export function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not set. Add it to .env to enable billing (see README).");
  }
  return new Stripe(secretKey);
}

export const PRO_PLAN_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID;
