import { getPrisma, isDatabaseConfigured } from "@/lib/prisma";
import { mockAccount, mockBilling } from "@/lib/mock-data";
import { planFromSubscription } from "@/lib/entitlements";
import { countScansToday, getPlanLimits } from "@/lib/plan-limits";
import type { AccountInfo, BillingInfo, PlanTier } from "@/lib/types";

export async function getBillingInfo(userId: string): Promise<BillingInfo> {
  if (!isDatabaseConfigured()) return mockBilling;

  const prisma = getPrisma();
  const [subscription, projects, scansToday] = await Promise.all([
    prisma.subscription.findUnique({ where: { userId } }),
    prisma.project.findMany({ where: { userId }, select: { keywords: true } }),
    countScansToday(userId),
  ]);

  // Never trust the stored plan/status alone — see lib/entitlements.ts for
  // why this has to be a live check against currentPeriodEnd.
  const plan: PlanTier = planFromSubscription(subscription);

  return {
    plan,
    status: subscription?.status ?? "ACTIVE",
    renewsOn: subscription?.currentPeriodEnd?.toISOString() ?? null,
    limits: getPlanLimits(plan),
    usage: {
      projects: projects.length,
      maxKeywordsInProject: projects.length
        ? Math.max(...projects.map((p) => p.keywords.length))
        : 0,
      scansToday,
    },
  };
}

export async function getAccountInfo(userId: string): Promise<AccountInfo> {
  if (!isDatabaseConfigured()) return mockAccount;

  const user = await getPrisma().user.findUnique({ where: { id: userId } });
  if (!user) return mockAccount;

  return {
    name: user.name ?? "Account",
    email: user.email,
    image: user.image,
    timezone: user.timezone,
    emailDigestOn: user.emailDigestOn,
  };
}
