import { handleFreemiusWebhook } from "@/lib/billing-freemius";

export const dynamic = "force-dynamic";

/**
 * Thin route — every Freemius-specific detail (SDK, event names, payload
 * shapes, signature verification) lives in lib/billing-freemius.ts. The SDK
 * verifies the request's signature itself; a failed/invalid signature is
 * rejected by the processor before any handler runs.
 */
export async function POST(req: Request) {
  return handleFreemiusWebhook(req);
}
