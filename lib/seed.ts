import { getPrisma } from "@/lib/prisma";
import { mockBilling, mockDigestLogs, mockLeads, mockProjects } from "@/lib/mock-data";

/**
 * Runs once, the moment a brand-new user's row is created (see the
 * `createUser` event in lib/auth.ts). Populates their account with the same
 * realistic sample projects/leads/digest history used in the mock-data demo,
 * so a freshly signed-in user sees a fully populated product immediately
 * instead of an empty dashboard.
 */
export async function seedDemoDataForUser(userId: string): Promise<void> {
  const prisma = getPrisma();

  const projectIdByMockId: Record<string, string> = {};
  for (const project of mockProjects) {
    const created = await prisma.project.create({
      data: {
        userId,
        name: project.name,
        keywords: project.keywords,
        frequency: project.frequency,
        deliveryHour: project.deliveryHour,
        paused: project.paused,
      },
    });
    projectIdByMockId[project.id] = created.id;
  }

  await prisma.lead.createMany({
    data: mockLeads.map((lead) => ({
      projectId: projectIdByMockId[lead.projectId],
      postUri: lead.postUri,
      authorHandle: lead.authorHandle,
      text: lead.text,
      url: lead.url,
      score: lead.score,
      status: lead.status,
      matchedOn: lead.matchedOn,
      createdAt: new Date(lead.createdAt),
    })),
  });

  await prisma.digestLog.createMany({
    data: Object.entries(mockDigestLogs).flatMap(([mockProjectId, logs]) =>
      logs.map((log) => ({
        projectId: projectIdByMockId[mockProjectId],
        sentAt: new Date(log.sentAt),
        leadCount: log.leadCount,
        opened: log.opened,
      })),
    ),
  });

  await prisma.subscription.create({
    data: {
      userId,
      plan: mockBilling.plan,
      status: mockBilling.status,
    },
  });
}
