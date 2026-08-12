import { getPrisma, isDatabaseConfigured } from "@/lib/prisma";
import { mockAccount, mockBilling } from "@/lib/mock-data";
import type { AccountInfo, BillingInfo, PlanTier } from "@/lib/types";

const PLAN_LIMITS: Record<PlanTier, BillingInfo["limits"]> = {
  FREE: { projects: 1, subredditsPerProject: 4, scansPerDay: 1 },
  PRO: { projects: 999, subredditsPerProject: 999, scansPerDay: 2 },
};

export async function getBillingInfo(userId: string): Promise<BillingInfo> {
  if (!isDatabaseConfigured()) return mockBilling;

  const prisma = getPrisma();
  const [subscription, projects] = await Promise.all([
    prisma.subscription.findUnique({ where: { userId } }),
    prisma.project.findMany({ where: { userId }, select: { subreddits: true } }),
  ]);

  const plan: PlanTier = subscription?.plan ?? "FREE";
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const scannedToday = await prisma.digestLog.count({
    where: { project: { userId }, sentAt: { gte: todayStart } },
  });

  return {
    plan,
    status: subscription?.status ?? "ACTIVE",
    renewsOn: subscription?.currentPeriodEnd?.toISOString() ?? null,
    limits: PLAN_LIMITS[plan],
    usage: {
      projects: projects.length,
      maxSubredditsInAnyProject: projects.length
        ? Math.max(...projects.map((p) => p.subreddits.length))
        : 0,
      scansToday: scannedToday > 0 ? 1 : 0,
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
