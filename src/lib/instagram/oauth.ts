import {
  INSTAGRAM_AUTH_URL,
  INSTAGRAM_GRAPH_URL,
  INSTAGRAM_OAUTH_SCOPES,
  INSTAGRAM_TOKEN_URL,
  instagramConfig,
} from "@/lib/instagram/config";

/** Step 1: where we send the user to authorize the app. */
export function buildInstagramAuthorizationUrl(state: string): string {
  const url = new URL(INSTAGRAM_AUTH_URL);
  url.searchParams.set("client_id", instagramConfig.appId);
  url.searchParams.set("redirect_uri", instagramConfig.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", INSTAGRAM_OAUTH_SCOPES.join(","));
  url.searchParams.set("state", state);
  return url.toString();
}

type ShortLivedTokenResponse = {
  data?: Array<{ access_token: string; user_id: string; permissions?: string | string[] }>;
  access_token?: string;
  user_id?: string;
  permissions?: string | string[];
};

function normalizePermissions(permissions: string | string[] | undefined): string[] {
  if (!permissions) return [];
  return Array.isArray(permissions) ? permissions : permissions.split(",").map((p) => p.trim());
}

/**
 * Step 2: exchange the ?code= from the callback for a short-lived token.
 *
 * Also returns the `permissions` list straight from Meta's response — this
 * is the actual, first-party record of which scopes were granted, as
 * opposed to which scopes we merely requested in the authorize URL.
 */
export async function exchangeCodeForShortLivedToken(
  code: string
): Promise<{ accessToken: string; userId: string; grantedPermissions: string[] }> {
  const body = new URLSearchParams({
    client_id: instagramConfig.appId,
    client_secret: instagramConfig.appSecret,
    grant_type: "authorization_code",
    redirect_uri: instagramConfig.redirectUri,
    code,
  });

  const response = await fetch(INSTAGRAM_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const json = (await response.json().catch(() => null)) as ShortLivedTokenResponse | null;

  if (!response.ok || !json) {
    throw new Error(`Instagram token exchange failed: ${response.status} ${JSON.stringify(json)}`);
  }

  // Meta has shipped this endpoint returning either a flat object or a
  // `data: [...]` wrapper at different times — handle both defensively.
  const entry = json.data?.[0] ?? json;
  if (!entry?.access_token || !entry.user_id) {
    throw new Error(`Instagram token exchange returned an unexpected shape: ${JSON.stringify(json)}`);
  }

  const grantedPermissions = normalizePermissions(entry.permissions);
  // Visible in Vercel's function logs regardless of what the UI shows.
  console.log("Instagram OAuth granted permissions:", grantedPermissions);

  return { accessToken: entry.access_token, userId: String(entry.user_id), grantedPermissions };
}

/** Step 3: trade the short-lived token for a 60-day long-lived token. */
export async function exchangeForLongLivedToken(
  shortLivedToken: string
): Promise<{ accessToken: string; expiresInSeconds: number }> {
  const url = new URL(`${INSTAGRAM_GRAPH_URL}/access_token`);
  url.searchParams.set("grant_type", "ig_exchange_token");
  url.searchParams.set("client_secret", instagramConfig.appSecret);
  url.searchParams.set("access_token", shortLivedToken);

  const response = await fetch(url.toString());
  const json = (await response.json().catch(() => null)) as
    | { access_token: string; token_type: string; expires_in: number }
    | null;

  if (!response.ok || !json?.access_token) {
    throw new Error(`Instagram long-lived token exchange failed: ${response.status} ${JSON.stringify(json)}`);
  }

  return { accessToken: json.access_token, expiresInSeconds: json.expires_in };
}

/** Step 4: fetch the connected account's username so the UI has something to show. */
export async function fetchInstagramProfile(
  accessToken: string
): Promise<{ userId: string; username: string }> {
  const url = new URL(`${INSTAGRAM_GRAPH_URL}/me`);
  url.searchParams.set("fields", "user_id,username");
  url.searchParams.set("access_token", accessToken);

  const response = await fetch(url.toString());
  const json = (await response.json().catch(() => null)) as
    | { user_id: string; username: string }
    | null;

  if (!response.ok || !json) {
    throw new Error(`Fetching Instagram profile failed: ${response.status} ${JSON.stringify(json)}`);
  }

  return { userId: String(json.user_id), username: json.username };
}

/**
 * Fetches a message sender's profile (name/username) by their
 * Instagram-scoped ID (IGSID). Used to replace the "Instagram user
 * xxxxxx" placeholder with a real name once available. Best-effort:
 * callers should treat a failure here as non-fatal, since not every
 * IGSID is guaranteed to return a username (e.g. privacy settings).
 */
export async function fetchInstagramSenderProfile(
  igsid: string,
  accessToken: string
): Promise<{ name: string | null; username: string | null }> {
  const url = new URL(`${INSTAGRAM_GRAPH_URL}/${igsid}`);
  url.searchParams.set("fields", "name,username");
  url.searchParams.set("access_token", accessToken);

  const response = await fetch(url.toString());
  const json = (await response.json().catch(() => null)) as { name?: string; username?: string } | null;

  if (!response.ok || !json) {
    throw new Error(`Fetching sender profile failed: ${response.status} ${JSON.stringify(json)}`);
  }

  return { name: json.name ?? null, username: json.username ?? null };
}

/**
 * Sends a text message to a customer via Instagram's Send API. Requires
 * the business account's access token; recipientIgsid is the customer's
 * Instagram-scoped ID captured from an inbound webhook event.
 */
export async function sendInstagramMessage(
  igBusinessAccountId: string,
  accessToken: string,
  recipientIgsid: string,
  text: string
): Promise<{ messageId: string }> {
  const url = new URL(`${INSTAGRAM_GRAPH_URL}/${igBusinessAccountId}/messages`);
  url.searchParams.set("access_token", accessToken);

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { id: recipientIgsid },
      message: { text },
    }),
  });

  const json = (await response.json().catch(() => null)) as { message_id?: string } | null;

  if (!response.ok || !json?.message_id) {
    throw new Error(`Instagram send message failed: ${response.status} ${JSON.stringify(json)}`);
  }

  return { messageId: json.message_id };
}
