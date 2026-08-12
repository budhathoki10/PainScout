import type { PlanTier, SubscriptionStatus } from "@/lib/types";

// Statuses that grant paid access at all — checked alongside the time bound
// below, not instead of it.
const ACTIVE_SUBSCRIPTION_STATUSES: SubscriptionStatus[] = ["ACTIVE", "PAST_DUE"];

/**
 * Whether a subscription currently grants Pro access, decided live against
 * `now` rather than trusting the stored status/plan alone.
 *
 * There is no cron job that sweeps subscriptions and downgrades one once its
 * paid period ends — Freemius does not reliably fire a webhook exactly when
 * a period lapses (a failed renewal charge may be reported only after
 * several retries, or not at all if webhook delivery itself fails). So
 * access is computed here, at read time, every time it's checked: a stored
 * expiration compared against the current time — the same way the Freemius
 * SDK's own EntitlementService decides activity.
 *
 * `currentPeriodEnd: null` is treated as still active (covers rows with no
 * period end on record); everything else must not have expired yet.
 */
export function isSubscriptionCurrentlyActive(
  subscription: { status: SubscriptionStatus; currentPeriodEnd: Date | null } | null | undefined,
): boolean {
  if (!subscription) return false;
  if (!ACTIVE_SUBSCRIPTION_STATUSES.includes(subscription.status)) return false;
  if (subscription.currentPeriodEnd && subscription.currentPeriodEnd.getTime() <= Date.now()) return false;
  return true;
}

/** Derives the effective plan tier the same way isSubscriptionCurrentlyActive does. */
export function planFromSubscription(
  subscription: { status: SubscriptionStatus; currentPeriodEnd: Date | null } | null | undefined,
): PlanTier {
  return isSubscriptionCurrentlyActive(subscription) ? "PRO" : "FREE";
}
