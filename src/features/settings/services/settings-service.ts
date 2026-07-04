import {
  getInstagramSettings,
  saveInstagramSettingsManual,
  markVerified,
} from "@/features/settings/repositories/settings-repository";
import {
  EMPTY_INSTAGRAM_SETTINGS,
  MASKED_TOKEN_PLACEHOLDER,
  type InstagramSettings,
} from "@/features/settings/types";
import { getCurrentUser } from "@/lib/auth/current-user";

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
 * Manual-entry verification: since Phase 2's real connection now happens
 * through OAuth (see /api/auth/instagram/connect), this just checks the
 * hand-typed fields are non-empty, same as Phase 1. It does not call Meta.
 */
export async function verifyInstagramConnection(settings: ManualFields): Promise<InstagramSettings> {
  const user = await getCurrentUser();
  if (!user) return EMPTY_INSTAGRAM_SETTINGS;

  const current = await getInstagramSettings(user.id);
  const resolved = resolveManualFields(current, settings);

  const hasAllFields = Boolean(
    resolved.username.trim() && resolved.businessAccountId.trim() && (resolved.accessToken ?? current.accessToken).trim()
  );

  await saveInstagramSettingsManual(user.id, resolved);
  return markVerified(user.id, hasAllFields);
}
