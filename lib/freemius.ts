import { Freemius } from "@freemius/sdk";

// Official Freemius SDK client. Replaces the previous hand-rolled HMAC
// signature verification (unverified against Freemius's real webhook
// format) and client-editable checkout query string — the SDK verifies
// webhook signatures itself and builds checkout links via an authenticated
// server-to-server call. See lib/billing-freemius.ts for everything built
// on top of this client.
export function isFreemiusConfigured(): boolean {
  return Boolean(
    process.env.FREEMIUS_PRODUCT_ID &&
      process.env.FREEMIUS_API_KEY &&
      process.env.FREEMIUS_SECRET_KEY &&
      process.env.FREEMIUS_PUBLIC_KEY,
  );
}

export const freemius = isFreemiusConfigured()
  ? new Freemius({
      productId: Number(process.env.FREEMIUS_PRODUCT_ID),
      apiKey: process.env.FREEMIUS_API_KEY!,
      secretKey: process.env.FREEMIUS_SECRET_KEY!,
      publicKey: process.env.FREEMIUS_PUBLIC_KEY!,
    })
  : null;

/** The single plan this product sells. Pain Scout has no multi-tier/period matrix. */
export function getFreemiusPlanId(): string | null {
  return process.env.FREEMIUS_PRO_PLAN_ID ?? null;
}
