/**
 * Reddit OAuth2 access via native fetch — application-only auth (client-
 * credentials grant), sufficient for reading public subreddit listings, no
 * Reddit user login required. Create an app at https://www.reddit.com/prefs/apps
 * (type: "script") to get REDDIT_CLIENT_ID / REDDIT_CLIENT_SECRET.
 *
 * Why not `snoowrap`: it runs on the deprecated `request`/`request-promise`
 * HTTP client, whose request fingerprint Reddit's anti-scraping layer blocks
 * outright (reproduced consistently across networks).
 *
 * Why not the public `www.reddit.com/*.json` endpoints: also confirmed
 * blocked (403, served the full HTML app shell) from this network, even via
 * plain `curl` with no app code involved at all — `www.reddit.com` appears to
 * have materially stricter bot-blocking than the dedicated `oauth.reddit.com`
 * API subdomain, which *does* let requests through (it returns a clean 401
 * for bad credentials rather than a network-level block). OAuth is therefore
 * the only viable path; it just needs a correctly-configured "script" app.
 */

export interface RawRedditPost {
  id: string;
  subreddit: string;
  title: string;
  selftext: string;
  url: string;
  author: string;
  createdUtc: number;
}

interface RedditListingChild {
  data: {
    id: string;
    subreddit: string;
    title: string;
    selftext: string;
    permalink: string;
    author: string;
    created_utc: number;
  };
}

interface RedditListingResponse {
  data: { children: RedditListingChild[] };
}

let cachedToken: { accessToken: string; expiresAt: number } | null = null;

function getUserAgent(): string {
  return process.env.REDDIT_USER_AGENT ?? "web:reddit-pain-scout:1.0.0 (by /u/unknown)";
}

async function getAccessToken(): Promise<string> {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      "REDDIT_CLIENT_ID / REDDIT_CLIENT_SECRET are not set. Create a 'script' app at https://www.reddit.com/prefs/apps and add the credentials to .env (see README).",
    );
  }

  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.accessToken;
  }

  const res = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": getUserAgent(),
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    throw new Error(`Reddit OAuth token request failed: ${res.status} ${await res.text()}`);
  }

  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    accessToken: json.access_token,
    // Refresh a minute early so a request never rides in on a token that
    // expires mid-flight.
    expiresAt: Date.now() + (json.expires_in - 60) * 1000,
  };
  return cachedToken.accessToken;
}

export async function fetchNewPosts(subreddit: string, limit = 25): Promise<RawRedditPost[]> {
  const token = await getAccessToken();

  const res = await fetch(
    `https://oauth.reddit.com/r/${encodeURIComponent(subreddit)}/new?limit=${limit}&raw_json=1`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": getUserAgent(),
      },
    },
  );

  if (!res.ok) {
    throw new Error(`Reddit fetch failed for r/${subreddit}: ${res.status} ${await res.text()}`);
  }

  const json = (await res.json()) as RedditListingResponse;
  return json.data.children.map(({ data: post }) => ({
    id: post.id,
    subreddit: post.subreddit ?? subreddit,
    title: post.title,
    selftext: post.selftext ?? "",
    url: `https://reddit.com${post.permalink}`,
    author: post.author ?? "[deleted]",
    createdUtc: post.created_utc,
  }));
}

/** Fetches new posts across every tracked subreddit for a project. Failures on
 * an individual subreddit (banned/private/typo) don't take down the whole scan. */
export async function fetchNewPostsForSubreddits(
  subreddits: string[],
  limit = 25,
): Promise<RawRedditPost[]> {
  const results = await Promise.all(
    subreddits.map((s) =>
      fetchNewPosts(s, limit).catch((err) => {
        console.error(`[reddit] failed to fetch r/${s}:`, err);
        return [] as RawRedditPost[];
      }),
    ),
  );
  return results.flat();
}
