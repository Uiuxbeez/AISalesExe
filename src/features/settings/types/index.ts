export type InstagramConnectionState = "unverified" | "verified" | "failed";

export type InstagramSettings = {
  username: string;
  businessAccountId: string;
  accessToken: string;
  connectionState: InstagramConnectionState;
};
