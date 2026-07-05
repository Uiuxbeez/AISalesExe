import {
  getInstagramSettings,
  getRawAccessToken,
  saveInstagramSettingsManual,
  markVerified,
} from "@/features/settings/repositories/settings-repository";
import {
  EMPTY_INSTAGRAM_SETTINGS,
  MASKED_TOKEN_PLACEHOLDER,
  type InstagramSettings,
} from "@/features/settings/types";
import { getCurrentUser } from "@/lib/auth/current-user";
import { fetchInstagramProfile } from "@/lib/instagram/oauth";

type ManualFields = Pick<InstagramSettings, "username" | "businessAccountId" | "accessToken">;
type ResolvedManualFields = Pick<InstagramSettings, "username" | "businessAccountId"> & {
  /** undefined means "leave the stored token alone" (echoed-back mask, nothing typed). */
  accessToken: string | undefined;
};

/**
 * The settings form echoes back a masked placeholder for a token it never
 * actually saw. Treat that as "leave the stored token alone" so a manual
 * save/verify can't silently overwrite a real OAuth-issued token by
 * accident.
 */
function resolveManualFields(current: InstagramSettings, incoming: ManualFields): ResolvedManualFields {
  const untouched = incoming.accessToken === MASKED_TOKEN_PLACEHOLDER && current.accessToken === MASKED_TOKEN_PLACEHOLDER;
  return {
    username: incoming.username,
    businessAccountId: incoming.businessAccountId,
    accessToken: untouched ? undefined : incoming.accessToken,
  };
}

export async function fetchInstagramSettings(): Promise<InstagramSettings> {
  const user = await getCurrentUser();
  if (!user) return EMPTY_INSTAGRAM_SETTINGS;
  return getInstagramSettings(user.id);
}

export async function updateInstagramSettings(settings: ManualFields): Promise<InstagramSettings> {
  const user = await getCurrentUser();
  if (!user) return EMPTY_INSTAGRAM_SETTINGS;

  const current = await getInstagramSettings(user.id);
  const resolved = resolveManualFields(current, settings);
  return saveInstagramSettingsManual(user.id, resolved);
}

/**
 * Actually verifies the connection against Meta's API — calls
 * graph.instagram.com/me with the stored/typed token and checks it's a
 * real, live token. This does NOT just check that the fields are
 * non-empty; a wrong or fake token will now correctly report as failed.
 */
export async function verifyInstagramConnection(settings: ManualFields): Promise<InstagramSettings> {
  const user = await getCurrentUser();
  if (!user) return EMPTY_INSTAGRAM_SETTINGS;

  const current = await getInstagramSettings(user.id);
  const resolved = resolveManualFields(current, settings);

  // Persist whatever was typed first (username/business id, and the token
  // if a new one was actually entered), so the attempt is visible even if
  // verification below fails.
  await saveInstagramSettingsManual(user.id, resolved);

  const tokenToTest = resolved.accessToken ?? (await getRawAccessToken(user.id));

  if (!tokenToTest) {
    return markVerified(user.id, { isConnected: false });
  }

  try {
    const profile = await fetchInstagramProfile(tokenToTest);
    // Use the real profile Meta returns rather than trusting whatever the
    // user typed into the username/business ID fields.
    return markVerified(user.id, {
      isConnected: true,
      username: profile.username,
      businessAccountId: profile.userId,
    });
  } catch {
    return markVerified(user.id, { isConnected: false });
  }
}
