/**
 * Config for the "Instagram API with Instagram Login" flow (graph.instagram.com).
 * This is the current (2026) Meta-recommended path for a single Instagram
 * professional account to authorize an app directly — no Facebook Page or
 * Facebook Login required. See:
 * https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required env var "${name}". Copy .env.example to .env and fill in your Meta App credentials.`
    );
  }
  return value;
}

export const instagramConfig = {
  get appId() {
    return required("INSTAGRAM_APP_ID");
  },
  get appSecret() {
    return required("INSTAGRAM_APP_SECRET");
  },
  get redirectUri() {
    return required("INSTAGRAM_REDIRECT_URI");
  },
  get webhookVerifyToken() {
    return required("INSTAGRAM_WEBHOOK_VERIFY_TOKEN");
  },
};

/** Scopes needed to receive and (eventually) send DMs. */
export const INSTAGRAM_OAUTH_SCOPES = [
  "instagram_business_basic",
  "instagram_business_manage_messages",
];

export const INSTAGRAM_AUTH_URL = "https://www.instagram.com/oauth/authorize";
export const INSTAGRAM_TOKEN_URL = "https://api.instagram.com/oauth/access_token";
export const INSTAGRAM_GRAPH_URL = "https://graph.instagram.com";

export const OAUTH_STATE_COOKIE_NAME = "ig_oauth_state";
