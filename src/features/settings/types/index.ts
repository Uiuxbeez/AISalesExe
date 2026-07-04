export type InstagramConnectionState = "unverified" | "verified" | "failed";

export type InstagramSettings = {
  username: string;
  businessAccountId: string;
  accessToken: string;
  connectionState: InstagramConnectionState;
  /** True once a real OAuth token has been stored (Phase 2). */
  isConnected: boolean;
  lastVerifiedAt: string | null;
};

export const EMPTY_INSTAGRAM_SETTINGS: InstagramSettings = {
  username: "",
  businessAccountId: "",
  accessToken: "",
  connectionState: "unverified",
  isConnected: false,
  lastVerifiedAt: null,
};

/**
 * Placeholder the repository sends back instead of a real access token, so
 * the real secret never round-trips to the browser. The settings service
 * uses this to detect "user didn't actually change the token" and avoid
 * clobbering a real OAuth-issued token with a manual save.
 */
export const MASKED_TOKEN_PLACEHOLDER = "••••••••••••••••";
