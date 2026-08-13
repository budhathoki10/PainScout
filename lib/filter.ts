import type { BlueskyPost } from "@/lib/bluesky";

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
  "check my profile",
  "claim today",
  "affiliate link",
  "link in bio",
  "passive income with automation",
  "faceless youtube automation",
];

// Bot/spam accounts append the same pipe-delimited list of buzzword phrases
// ("Faceless YouTube automation| Best AI tools...| How to start...") to
// otherwise-unrelated posts to farm keyword matches. Organic writing almost
// never uses 3+ literal "|" separators, so this is a reliable structural tell
// that doesn't depend on catching every specific phrase they rotate through.
const MAX_PIPE_SEGMENTS = 2;

export interface ScoredLead {
  post: BlueskyPost;
  score: number;
  matchedKeywords: string[];
}

// Any real post matching at least one tracked keyword clears this — spam and
// noise are already rejected above by NOISE_PHRASES/MAX_PIPE_SEGMENTS, so
// this floor exists only to drop the rare 0-signal edge case, not to require
// complaint phrasing. Pain-phrase/question/length bonuses still raise the
// score shown on each lead, which is what ranking and the digest email sort by.
const MIN_SCORE_THRESHOLD = 20;

// Bluesky search can surface old posts the first time a keyword matches
// them — this isn't a "find it right now" signal at that point, so anything
// older than this is treated as noise regardless of how well it scores.
const MAX_POST_AGE_DAYS = 7;

export function scorePost(post: BlueskyPost, keywords: string[]): ScoredLead | null {
  const ageMs = Date.now() - new Date(post.createdAt).getTime();
  if (ageMs > MAX_POST_AGE_DAYS * 24 * 60 * 60 * 1000) return null;

  const haystack = post.text.toLowerCase();

  const matchedKeywords = keywords.filter((k) => haystack.includes(k.toLowerCase()));
  if (matchedKeywords.length === 0) return null;

  const isNoise = NOISE_PHRASES.some((p) => haystack.includes(p));
  if (isNoise) return null;

  const pipeSegments = (post.text.match(/\|/g) ?? []).length;
  if (pipeSegments > MAX_PIPE_SEGMENTS) return null;

  let score = 0;
  score += matchedKeywords.length * 20; // each distinct keyword hit
  score += PAIN_PHRASES.filter((p) => haystack.includes(p)).length * 12;
  if (haystack.includes("?")) score += 5; // questions skew toward genuine asks
  if (post.text.length > 120) score += 8; // a fuller post beats a one-liner (Bluesky caps posts at 300 chars)

  score = Math.min(100, score);
  if (score < MIN_SCORE_THRESHOLD) return null;

  return { post, score, matchedKeywords };
}

export function filterPosts(posts: BlueskyPost[], keywords: string[]): ScoredLead[] {
  return posts
    .map((post) => scorePost(post, keywords))
    .filter((lead): lead is ScoredLead => lead !== null);
}
