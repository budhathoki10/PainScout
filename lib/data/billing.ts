import { getPrisma, isDatabaseConfigured } from "@/lib/prisma";
import { mockAccount, mockBilling } from "@/lib/mock-data";
import { PLAN_LIMITS, resolvePlan } from "@/lib/entitlements";
import type { AccountInfo, BillingInfo } from "@/lib/types";

export async function getBillingInfo(userId: string): Promise<BillingInfo> {
  if (!isDatabaseConfigured()) return mockBilling;

  const prisma = getPrisma();
  const [subscription, projects] = await Promise.all([
    prisma.subscription.findUnique({ where: { userId } }),
    prisma.project.findMany({ where: { userId }, select: { keywords: true } }),
  ]);

  const plan = resolvePlan(subscription);
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
      maxKeywordsInProject: projects.length
        ? Math.max(...projects.map((p) => p.keywords.length))
        : 0,
      scansToday: scannedToday,
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
