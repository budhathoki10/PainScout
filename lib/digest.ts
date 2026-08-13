import type { ScoredLead } from "@/lib/filter";

const MAX_DIGEST_LENGTH = 40;

export interface DigestItem {
  postUri: string;
  authorHandle: string;
  text: string;
  url: string;
  score: number;
  matchedOn: string[];
  createdAt: string;
}

/** Ranks by score (desc) then recency (desc), caps to a reasonable digest length. */
export function rankForDigest(leads: ScoredLead[]): DigestItem[] {
  return [...leads]
    .sort(
      (a, b) =>
        b.score - a.score || new Date(b.post.createdAt).getTime() - new Date(a.post.createdAt).getTime(),
    )
    .slice(0, MAX_DIGEST_LENGTH)
    .map((lead) => ({
      postUri: lead.post.uri,
      authorHandle: lead.post.authorHandle,
      text: lead.post.text,
      url: lead.post.postUrl,
      score: lead.score,
      matchedOn: lead.matchedKeywords,
      createdAt: lead.post.createdAt,
    }));
}
