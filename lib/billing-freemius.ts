import { Prisma } from "@prisma/client";
import { getPrisma, isDatabaseConfigured } from "@/lib/prisma";
import { freemius, getFreemiusPlanId, isFreemiusConfigured } from "@/lib/freemius";
import type { WebhookEventType } from "@freemius/sdk";

// Freemius adapter — every Freemius-specific detail (the SDK, its event
// names, its payload shapes) lives in this one file. Callers only ever use
// buildCheckoutUrl / buildPortalUrl / handleFreemiusWebhook and never touch
// the SDK or Freemius's field names directly.
//
// BILLING POLICY:
//   - No refunds handler — a refunded license isn't force-deactivated here.
//   - Cancellation is immediate, not prorated (Pain Scout has one plan, no
//     upgrade/downgrade paths, so there's nothing to prorate).
//
// NO CRON: there is no periodic job that sweeps subscriptions and flips a
// status once currentPeriodEnd passes. Freemius does not reliably fire a
// webhook exactly when a period lapses (e.g. a silently failed renewal
// charge may only be reported after several retries, or not at all if the
// webhook delivery itself fails). Access is instead computed live, every
// time it's checked — see lib/entitlements.ts — by comparing the stored
// currentPeriodEnd against `now` at read time. Status is still updated here
// for support/dashboard visibility, but nothing depends on that write
// happening or being timely.

// Every event that represents a change to a license's state. One shared
// handler re-fetches the license's full purchase info and upserts our
// Subscription row from it — a license.created, a license.extended
// (renewal), and a license.plan.changed all end up here doing the same sync.
const LICENSE_SYNC_EVENTS = [
  "license.created",
  "license.extended",
  "license.shortened",
  "license.updated",
  "license.expired",
  "license.cancelled",
  "license.plan.changed",
] as const satisfies readonly WebhookEventType[];

async function findInternalUser(email: string | undefined | null) {
  if (!email) return null;
  const prisma = getPrisma();
  return prisma.user.findFirst({ where: { email: email.toLowerCase() }, select: { id: true } });
}

interface PurchaseLike {
  email: string;
  userId: string;
  subscriptionId: string | null;
  canceled: boolean;
  expiration: Date | null;
  planId: string;
}

// Shared by the webhook sync path below — writes a Subscription row from an
// already-resolved userId + freshly-fetched purchase info. currentPeriodStart
// is only ever set on first creation ("subscriber since"), never overwritten
// on renewal.
async function upsertSubscriptionForUser(userId: string, licenseId: string, purchase: PurchaseLike, existed: boolean) {
  const now = new Date();
  const prisma = getPrisma();

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      plan: "PRO",
      status: purchase.canceled ? "CANCELED" : "ACTIVE",
      fsLicenseId: licenseId,
      freemiusUserId: purchase.userId ? String(purchase.userId) : null,
      freemiusSubscriptionId: purchase.subscriptionId ? String(purchase.subscriptionId) : null,
      currentPeriodStart: now,
      currentPeriodEnd: purchase.expiration,
      canceledAt: purchase.canceled ? now : null,
    },
    update: {
      plan: "PRO",
      status: purchase.canceled ? "CANCELED" : "ACTIVE",
      fsLicenseId: licenseId,
      freemiusUserId: purchase.userId ? String(purchase.userId) : null,
      freemiusSubscriptionId: purchase.subscriptionId ? String(purchase.subscriptionId) : null,
      currentPeriodEnd: purchase.expiration,
      canceledAt: purchase.canceled ? now : null,
    },
  });

  void existed; // kept for symmetry with the sync path's existing-lookup; upsert already handles both branches.
}

// Re-fetches authoritative purchase state for a license (rather than trusting
// whatever fields a particular event happened to carry) and upserts the
// matching Subscription. Shared by every LICENSE_SYNC_EVENTS handler.
async function syncSubscriptionFromLicenseId(licenseId: string) {
  if (!freemius) return;

  const purchase = await freemius.purchase.retrievePurchase(licenseId);
  if (!purchase) {
    console.warn(`No Freemius purchase found for license "${licenseId}" — nothing to sync.`);
    return;
  }

  const planId = getFreemiusPlanId();
  if (planId && purchase.planId && String(purchase.planId) !== String(planId)) {
    console.warn(`License "${licenseId}" is for plan "${purchase.planId}", not this product's configured plan "${planId}" — skipping.`);
    return;
  }

  const prisma = getPrisma();
  const existing = await prisma.subscription.findFirst({ where: { fsLicenseId: licenseId }, select: { userId: true } });
  const userId = existing?.userId ?? (await findInternalUser(purchase.email))?.id ?? null;

  if (!userId) {
    console.warn(`No User found for email "${purchase.email}" — cannot attribute Freemius license "${licenseId}".`);
    return;
  }

  await upsertSubscriptionForUser(
    userId,
    licenseId,
    {
      email: purchase.email,
      userId: purchase.userId,
      subscriptionId: purchase.subscriptionId,
      canceled: purchase.canceled,
      expiration: purchase.expiration,
      planId: purchase.planId,
    },
    Boolean(existing),
  );
}

// license.deleted carries only the license id — no purchase left to
// retrieve, so just mark whatever we already have for it as canceled.
async function markLicenseDeleted(licenseId: string) {
  const prisma = getPrisma();
  const now = new Date();
  const result = await prisma.subscription.updateMany({
    where: { fsLicenseId: licenseId },
    data: { status: "CANCELED", canceledAt: now },
  });
  if (result.count === 0) {
    console.warn(`license.deleted: no Subscription found for fsLicenseId "${licenseId}".`);
  }
}

// Informational only — see the NO CRON note above. A failed renewal charge
// doesn't cut access by itself; the live currentPeriodEnd check in
// lib/entitlements.ts is what actually does that once the paid period runs
// out. This just keeps the status label accurate in the meantime.
async function markRenewalFailed(licenseId: string) {
  const prisma = getPrisma();
  const result = await prisma.subscription.updateMany({
    where: { fsLicenseId: licenseId, status: { not: "CANCELED" } },
    data: { status: "PAST_DUE" },
  });
  if (result.count === 0) {
    console.warn(`subscription.renewal.failed: no active Subscription found for fsLicenseId "${licenseId}".`);
  }
}

async function logWebhookError(error: unknown) {
  console.error("Freemius webhook handler failed:", error);
}

// The SDK verifies the signature and parses the event but does nothing to
// stop the same event being delivered twice (a genuine Freemius retry, or a
// captured payload replayed by an attacker) — claims event.id for this
// event exactly once via the unique [provider, eventId] index; returns true
// if it was already claimed (skip), false if this delivery just claimed it.
async function isDuplicateEvent(eventId: string, eventType: string | undefined): Promise<boolean> {
  const prisma = getPrisma();
  try {
    await prisma.webhookEvent.create({ data: { provider: "freemius", eventId: String(eventId), eventType: eventType ?? null } });
    return false;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return true;
    throw error;
  }
}

// Wraps every registered handler with the replay guard above so
// buildListener()'s own handlers never have to think about it.
function withReplayGuard<T extends { id?: string; type?: string }>(handler: (event: T) => Promise<void>) {
  return async (event: T) => {
    if (!event?.id) {
      console.error(`Freemius webhook "${event?.type}" has no event.id — skipping (cannot guard against replay).`);
      return;
    }
    if (await isDuplicateEvent(event.id, event.type)) {
      console.warn(`Ignoring duplicate/replayed Freemius webhook event "${event.type}" (id: ${event.id}).`);
      return;
    }
    await handler(event);
  };
}

function buildListener() {
  if (!freemius) throw new Error("Freemius is not configured");

  const listener = freemius.webhook.createListener({ onError: logWebhookError });

  listener.on(
    [...LICENSE_SYNC_EVENTS],
    withReplayGuard(async (event) => {
      const licenseId = event.objects?.license?.id ? String(event.objects.license.id) : "";
      if (!licenseId) return;
      await syncSubscriptionFromLicenseId(licenseId);
    }),
  );

  listener.on(
    "license.deleted",
    withReplayGuard(async (event) => {
      const licenseId = event.data?.license_id ? String(event.data.license_id) : "";
      if (!licenseId) return;
      await markLicenseDeleted(licenseId);
    }),
  );

  listener.on(
    ["subscription.renewal.failed", "subscription.renewal.failed.last"],
    withReplayGuard(async (event) => {
      const licenseId = event.objects?.license?.id ? String(event.objects.license.id) : "";
      if (!licenseId) return;
      await markRenewalFailed(licenseId);
    }),
  );

  return listener;
}

/**
 * Builds a Freemius-hosted checkout link for this product's single Pro
 * plan. The buyer's email is locked read-only inside the checkout session
 * so a buyer can't pay under a different email than their Pain Scout
 * account. Pass existingLicenseId when the user already has one so the
 * checkout is authorized as an upgrade against it instead of starting an
 * unrelated second subscription.
 */
export async function buildCheckoutUrl(opts: { email: string; name?: string | null; existingLicenseId?: string | null }): Promise<string | null> {
  if (!freemius) return null;
  const planId = getFreemiusPlanId();
  if (!planId) return null;

  const [firstName, ...lastNameParts] = (opts.name ?? "").trim().split(/\s+/).filter(Boolean);

  const checkout = await freemius.checkout.create({
    user: {
      email: opts.email,
      ...(firstName ? { firstName } : {}),
      ...(lastNameParts.length ? { lastName: lastNameParts.join(" ") } : {}),
    },
    planId,
    isSandbox: process.env.NODE_ENV !== "production",
    ...(opts.existingLicenseId ? { licenseId: opts.existingLicenseId } : {}),
  });

  checkout.setBillingCycle("monthly");

  return checkout.getLink();
}

/**
 * Mints a link into Freemius's own hosted customer portal (manage payment
 * method, view invoices, cancel). Prefers the stored Freemius user id over
 * email since it's a stable id rather than something that could be typed
 * wrong or have changed.
 */
export async function buildPortalUrl(opts: { userId: string; email: string }): Promise<string | null> {
  if (!freemius) return null;

  const prisma = getPrisma();
  const subscription = await prisma.subscription.findUnique({
    where: { userId: opts.userId },
    select: { freemiusUserId: true },
  });

  const portal = subscription?.freemiusUserId
    ? await freemius.api.user.retrieveHostedCustomerPortal(subscription.freemiusUserId)
    : opts.email
      ? await freemius.api.user.retrieveHostedCustomerPortalByEmail(opts.email)
      : null;

  return portal?.link ?? null;
}

/**
 * Verifies (via the SDK's own signature check) and processes an incoming
 * Freemius webhook request end-to-end, syncing whatever Subscription row it
 * affects. Returns the Response to send back to Freemius directly.
 */
export async function handleFreemiusWebhook(request: Request): Promise<Response> {
  if (!isFreemiusConfigured() || !freemius) {
    return Response.json({ error: "Freemius is not configured" }, { status: 500 });
  }
  if (!isDatabaseConfigured()) {
    return Response.json({ error: "DATABASE_URL is not configured on the server." }, { status: 500 });
  }

  const listener = buildListener();
  const processor = freemius.webhook.createRequestProcessor(listener);
  return processor(request);
}
