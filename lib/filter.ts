import type { RawRedditPost } from "@/lib/reddit";

/**
 * Pain-point filtering: keyword scoring against tracked keywords plus a
 * heuristic "complaint signal" boost (phrasing that tends to indicate a
 * genuine problem rather than a meme, announcement, or casual mention).
 *
 * This is the "keyword scoring and/or lightweight AI classification" step
 * from the spec. To upgrade to an AI classifier, call an LLM here and blend
 * its confidence into `score` before the MIN_SCORE_THRESHOLD check —
 * everything downstream (ranking, digest, email) is unaffected.
 */

const PAIN_PHRASES = [
  "is there a tool",
  "anyone know of",
  "anyone have a recommendation",
  "looking for an alternative",
  "looking for a tool",
  "sick of",
  "tired of",
  "frustrated with",
  "hate that",
  "wish there was",
  "wish there were",
  "why is there no",
  "why isn't there",
  "does anyone else",
  "how do you all",
  "how do you handle",
  "struggling with",
  "can't find a good",
  "no good way to",
  "nightmare",
  "rant:",
  "ended up building",
  "cobbled together",
];

const NOISE_PHRASES = [
  "giveaway",
  "we're hiring",
  "hiring a",
  "[meme]",
  "shameless plug",
  "check out my",
  "affiliate link",
];

export interface ScoredLead {
  post: RawRedditPost;
  score: number;
  matchedKeywords: string[];
}

const MIN_SCORE_THRESHOLD = 35;

export function scorePost(post: RawRedditPost, keywords: string[]): ScoredLead | null {
  const haystack = `${post.title}\n${post.selftext}`.toLowerCase();

  const matchedKeywords = keywords.filter((k) => haystack.includes(k.toLowerCase()));
  if (matchedKeywords.length === 0) return null;

  const isNoise = NOISE_PHRASES.some((p) => haystack.includes(p));
  if (isNoise) return null;

  let score = 0;
  score += matchedKeywords.length * 20; // each distinct keyword hit
  score += PAIN_PHRASES.filter((p) => haystack.includes(p)).length * 12;
  if (haystack.includes("?")) score += 5; // questions skew toward genuine asks
  if (post.selftext.length > 200) score += 8; // detailed venting beats a one-liner
  if (post.title.toLowerCase().includes(matchedKeywords[0].toLowerCase())) score += 10; // keyword in title

  score = Math.min(100, score);
  if (score < MIN_SCORE_THRESHOLD) return null;

  return { post, score, matchedKeywords };
}

export function filterPosts(posts: RawRedditPost[], keywords: string[]): ScoredLead[] {
  return posts
    .map((post) => scorePost(post, keywords))
    .filter((lead): lead is ScoredLead => lead !== null);
}
