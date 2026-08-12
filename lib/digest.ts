import type { ScoredLead } from "@/lib/filter";

const MAX_DIGEST_LENGTH = 15;

export interface DigestItem {
  redditId: string;
  subreddit: string;
  title: string;
  snippet: string;
  url: string;
  author: string;
  score: number;
  matchedOn: string[];
  createdUtc: number;
}

/** Ranks by score (desc) then recency (desc), caps to a reasonable digest length. */
export function rankForDigest(leads: ScoredLead[]): DigestItem[] {
  return [...leads]
    .sort((a, b) => b.score - a.score || b.post.createdUtc - a.post.createdUtc)
    .slice(0, MAX_DIGEST_LENGTH)
    .map((lead) => ({
      redditId: lead.post.id,
      subreddit: lead.post.subreddit,
      title: lead.post.title,
      snippet: lead.post.selftext.slice(0, 220),
      url: lead.post.url,
      author: lead.post.author,
      score: lead.score,
      matchedOn: lead.matchedKeywords,
      createdUtc: lead.post.createdUtc,
    }));
}
