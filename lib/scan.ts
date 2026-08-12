import { getPrisma } from "@/lib/prisma";
import { searchMultipleKeywords } from "@/lib/bluesky";
import { filterPosts } from "@/lib/filter";
import { rankForDigest, type DigestItem } from "@/lib/digest";

/**
 * Core lead-fetch pipeline shared by the scheduled cron digest and the
 * manual "Scrape now" action: live Bluesky search -> pain filter -> rank ->
 * dedupe against already-stored leads -> persist. Callers decide separately
 * whether to email (only the scheduled cron run does) and whether to log a
 * DigestLog entry.
 */
export async function scanProjectForLeads(project: {
  id: string;
  keywords: string[];
}): Promise<DigestItem[]> {
  const prisma = getPrisma();

  const posts = await searchMultipleKeywords(project.keywords);
  const scored = filterPosts(posts, project.keywords);
  const ranked = rankForDigest(scored);

  const existingUris = new Set(
    (
      await prisma.lead.findMany({
        where: { projectId: project.id, postUri: { in: ranked.map((l) => l.postUri) } },
        select: { postUri: true },
      })
    ).map((l) => l.postUri),
  );
  const freshLeads = ranked.filter((l) => !existingUris.has(l.postUri));

  if (freshLeads.length > 0) {
    await prisma.lead.createMany({
      data: freshLeads.map((l) => ({
        projectId: project.id,
        postUri: l.postUri,
        authorHandle: l.authorHandle,
        text: l.text,
        url: l.url,
        score: l.score,
        matchedOn: l.matchedOn,
      })),
    });
  }

  return freshLeads;
}
