import { getPrisma, isDatabaseConfigured } from "@/lib/prisma";
import { planFromSubscription } from "@/lib/entitlements";
import type { BillingInfo, PlanTier } from "@/lib/types";

// Single source of truth for what each plan is allowed to do — imported by
// both the Billing page display (lib/data/billing.ts) and every server-side
// enforcement point (project create/update, manual scrape, cron digest) so
// there's exactly one place these numbers can go out of sync with each
// other: nowhere.
export const PLAN_LIMITS: Record<PlanTier, BillingInfo["limits"]> = {
  FREE: { projects: 1, keywordsPerProject: 5, scansPerDay: 1 },
  PRO: { projects: 999, keywordsPerProject: 999, scansPerDay: 2 },
};

export function getPlanLimits(plan: PlanTier): BillingInfo["limits"] {
  return PLAN_LIMITS[plan];
}

/** Looks up a user's current effective plan (live expiry check, not the raw stored field). */
export async function getEffectivePlan(userId: string): Promise<PlanTier> {
  if (!isDatabaseConfigured()) return "FREE";
  const subscription = await getPrisma().subscription.findUnique({ where: { userId } });
  return planFromSubscription(subscription);
}

function todayStart(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Every scan today for this user across all their projects — scheduled digests and manual scrapes alike. */
export async function countScansToday(userId: string): Promise<number> {
  if (!isDatabaseConfigured()) return 0;
  return getPrisma().digestLog.count({
    where: { project: { userId }, sentAt: { gte: todayStart() } },
  });
}

export interface ScanLimitCheck {
  allowed: boolean;
  used: number;
  limit: number;
  plan: PlanTier;
}

/**
 * Whether this user has scan budget left today, counting both scheduled
 * cron digests and manual "Scrape now" runs against the same daily total —
 * a plan's scansPerDay is a shared budget, not a per-source allowance.
 */
export async function canScanToday(userId: string): Promise<ScanLimitCheck> {
  const plan = await getEffectivePlan(userId);
  const limit = getPlanLimits(plan).scansPerDay;
  const used = await countScansToday(userId);
  return { allowed: used < limit, used, limit, plan };
}
