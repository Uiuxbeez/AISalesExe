import type { InstagramSettings } from "@/features/settings/types";

/**
 * In-memory placeholder for the InstagramSettings table. The schema
 * already exists in Prisma; wiring this repository to real queries —
 * and actually calling the Meta Graph API — is scoped to a later phase.
 */
let currentSettings: InstagramSettings = {
  username: "",
  businessAccountId: "",
  accessToken: "",
  connectionState: "unverified",
};

export async function getInstagramSettings(): Promise<InstagramSettings> {
  return currentSettings;
}

export async function saveInstagramSettings(
  settings: InstagramSettings
): Promise<InstagramSettings> {
  currentSettings = settings;
  return currentSettings;
}
