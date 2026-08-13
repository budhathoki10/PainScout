import { getPrisma } from "@/lib/prisma";
import type { PlanTier } from "@/lib/types";

export const PLAN_LIMITS: Record<PlanTier, { projects: number; keywordsPerProject: number; scansPerDay: number }> = {
  FREE: { projects: 1, keywordsPerProject: 5, scansPerDay: 1 },
  PRO: { projects: 999, keywordsPerProject: 999, scansPerDay: 2 },
};

/**
 * Hard cutoff: don't rely solely on the Freemius cancellation webhook
 * landing. If the paid period has already ended, treat the plan as FREE
 * immediately, even if the DB still says PRO because no webhook arrived.
 */
export function resolvePlan(subscription: { plan: PlanTier; currentPeriodEnd: Date | null } | null): PlanTier {
  if (!subscription) return "FREE";
  if (subscription.plan === "PRO" && subscription.currentPeriodEnd && subscription.currentPeriodEnd < new Date()) {
    return "FREE";
  }
  return subscription.plan;
}

export async function getUserPlan(userId: string): Promise<PlanTier> {
  const subscription = await getPrisma().subscription.findUnique({ where: { userId } });
  return resolvePlan(subscription);
}
