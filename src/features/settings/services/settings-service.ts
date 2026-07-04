import {
  getInstagramSettings,
  saveInstagramSettings,
} from "@/features/settings/repositories/settings-repository";
import type { InstagramSettings } from "@/features/settings/types";

export async function fetchInstagramSettings(): Promise<InstagramSettings> {
  return getInstagramSettings();
}

export async function updateInstagramSettings(
  settings: InstagramSettings
): Promise<InstagramSettings> {
  return saveInstagramSettings(settings);
}

/**
 * Simulates checking the Instagram connection. This never calls the
 * Meta Graph API — it only checks that the required fields are present
 * so the UI has something realistic to react to. Real verification is
 * scoped to the Instagram OAuth phase.
 */
export async function verifyInstagramConnection(
  settings: InstagramSettings
): Promise<InstagramSettings> {
  const hasAllFields = Boolean(
    settings.username.trim() && settings.businessAccountId.trim() && settings.accessToken.trim()
  );

  const updated: InstagramSettings = {
    ...settings,
    connectionState: hasAllFields ? "verified" : "failed",
  };

  return saveInstagramSettings(updated);
}
