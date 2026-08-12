const BSKY_BASE_URL = "https://bsky.social/xrpc";

// accessJwt expires after ~2h; refresh a bit early so we never fire a request
// with a token that's about to be rejected mid-flight.
const TOKEN_TTL_MS = 110 * 60 * 1000;

export interface BlueskyPost {
  uri: string;
  authorHandle: string;
  text: string;
  createdAt: string;
  postUrl: string;
}

interface CreateSessionResponse {
  accessJwt: string;
  refreshJwt: string;
  did: string;
  handle: string;
  active: boolean;
}

interface RawBlueskyPost {
  uri: string;
  cid: string;
  author: { handle: string; displayName?: string; did: string };
  record: { text: string; createdAt: string };
  replyCount?: number;
  repostCount?: number;
  likeCount?: number;
}

interface SearchPostsResponse {
  posts: RawBlueskyPost[];
  cursor?: string;
}

interface SessionCache {
  accessJwt: string;
  refreshJwt: string;
  did: string;
  handle: string;
  issuedAt: number;
}

let sessionCache: SessionCache | null = null;

function toCleanPost(raw: RawBlueskyPost): BlueskyPost {
  const postId = raw.uri.split("/").pop() ?? raw.uri;
  return {
    uri: raw.uri,
    authorHandle: raw.author.handle,
    text: raw.record.text,
    createdAt: raw.record.createdAt,
    postUrl: `https://bsky.app/profile/${raw.author.handle}/post/${postId}`,
  };
}

/**
 * Authenticates against Bluesky and returns a valid accessJwt, reusing the
 * cached session while it's still within its TTL window.
 */
export async function authenticate(): Promise<string> {
  const now = Date.now();
  if (sessionCache && now - sessionCache.issuedAt < TOKEN_TTL_MS) {
    return sessionCache.accessJwt;
  }

  const identifier = process.env.BLUESKY_HANDLE;
  const password = process.env.BLUESKY_APP_PASSWORD;
  if (!identifier || !password) {
    throw new Error("BLUESKY_HANDLE and BLUESKY_APP_PASSWORD must be set to authenticate with Bluesky.");
  }

  let response: Response;
  try {
    response = await fetch(`${BSKY_BASE_URL}/com.atproto.server.createSession`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });
  } catch (err) {
    throw new Error(`Failed to reach Bluesky auth endpoint: ${err instanceof Error ? err.message : String(err)}`);
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Bluesky authentication failed (${response.status}): ${detail || "check BLUESKY_HANDLE/BLUESKY_APP_PASSWORD"}`,
    );
  }

  const data: CreateSessionResponse = await response.json();
  sessionCache = {
    accessJwt: data.accessJwt,
    refreshJwt: data.refreshJwt,
    did: data.did,
    handle: data.handle,
    issuedAt: now,
  };
  return sessionCache.accessJwt;
}

function invalidateSession() {
  sessionCache = null;
}

/**
 * Searches Bluesky posts for a single query. On a 401 (expired/invalid
 * token) it re-authenticates once and retries before giving up.
 */
export async function searchPosts(query: string, accessJwt: string): Promise<BlueskyPost[]> {
  const url = `${BSKY_BASE_URL}/app.bsky.feed.searchPosts?q=${encodeURIComponent(query)}`;

  async function runSearch(token: string): Promise<Response> {
    try {
      return await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) {
      throw new Error(`Failed to reach Bluesky search endpoint: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  let response = await runSearch(accessJwt);

  if (response.status === 401) {
    invalidateSession();
    const freshToken = await authenticate();
    response = await runSearch(freshToken);
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Bluesky search failed (${response.status}) for query "${query}": ${detail}`);
  }

  const data: SearchPostsResponse = await response.json();
  return (data.posts ?? []).map(toCleanPost);
}

/**
 * Authenticates once, searches for every keyword, and returns the merged
 * results deduplicated by uri (a post can match more than one keyword).
 */
export async function searchMultipleKeywords(keywords: string[]): Promise<BlueskyPost[]> {
  const accessJwt = await authenticate();

  const seen = new Set<string>();
  const merged: BlueskyPost[] = [];

  for (const keyword of keywords) {
    const posts = await searchPosts(keyword, accessJwt);
    for (const post of posts) {
      if (seen.has(post.uri)) continue;
      seen.add(post.uri);
      merged.push(post);
    }
  }

  return merged;
}
