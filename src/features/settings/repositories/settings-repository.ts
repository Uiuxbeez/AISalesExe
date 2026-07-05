import { prisma } from "@/lib/db/prisma";
import type { InstagramSettings } from "@/features/settings/types";
import { EMPTY_INSTAGRAM_SETTINGS, MASKED_TOKEN_PLACEHOLDER } from "@/features/settings/types";

/**
 * Phase 2: real Prisma-backed reads/writes against `instagram_settings`,
 * replacing the Phase 1 in-memory placeholder.
 */

function toFeatureShape(
  row: {
    username: string | null;
    businessAccountId: string | null;
    accessToken: string | null;
    isConnected: boolean;
    lastVerifiedAt: Date | null;
  } | null
): InstagramSettings {
  if (!row) return EMPTY_INSTAGRAM_SETTINGS;

  return {
    username: row.username ?? "",
    businessAccountId: row.businessAccountId ?? "",
    // Never send the real token to the client — the UI only needs to know
    // one is present.
    accessToken: row.accessToken ? MASKED_TOKEN_PLACEHOLDER : "",
    connectionState: row.isConnected ? "verified" : "unverified",
    isConnected: row.isConnected,
    lastVerifiedAt: row.lastVerifiedAt ? row.lastVerifiedAt.toISOString() : null,
  };
}

export async function getInstagramSettings(userId: string): Promise<InstagramSettings> {
  const row = await prisma.instagramSettings.findUnique({ where: { userId } });
  return toFeatureShape(row);
}

/** Manual save from the settings form (username/business id/token typed by hand). */
export async function saveInstagramSettingsManual(
  userId: string,
  settings: {
    username: string;
    businessAccountId: string;
    /** undefined = leave the stored token untouched (e.g. masked value wasn't changed). */
    accessToken: string | undefined;
  }
): Promise<InstagramSettings> {
  const row = await prisma.instagramSettings.upsert({
    where: { userId },
    create: {
      userId,
      username: settings.username || null,
      businessAccountId: settings.businessAccountId || null,
      accessToken: settings.accessToken || null,
      isConnected: false,
    },
    update: {
      username: settings.username || null,
      businessAccountId: settings.businessAccountId || null,
      ...(settings.accessToken !== undefined
        ? { accessToken: settings.accessToken || null, isConnected: false, lastVerifiedAt: null }
        : {}),
    },
  });

  return toFeatureShape(row);
}

export async function markVerified(
  userId: string,
  result: { isConnected: false } | { isConnected: true; username: string; businessAccountId: string }
): Promise<InstagramSettings> {
  const row = await prisma.instagramSettings.update({
    where: { userId },
    data: result.isConnected
      ? {
          isConnected: true,
          lastVerifiedAt: new Date(),
          username: result.username,
          businessAccountId: result.businessAccountId,
        }
      : { isConnected: false, lastVerifiedAt: null },
  });

  return toFeatureShape(row);
}

/** Called by the OAuth callback once tokens + profile have been fetched from Meta. */
export async function saveInstagramSettingsFromOAuth(
  userId: string,
  data: { username: string; igUserId: string; accessToken: string; tokenExpiresAt: Date }
): Promise<InstagramSettings> {
  const row = await prisma.instagramSettings.upsert({
    where: { userId },
    create: {
      userId,
      username: data.username,
      businessAccountId: data.igUserId,
      accessToken: data.accessToken,
      tokenExpiresAt: data.tokenExpiresAt,
      isConnected: true,
      lastVerifiedAt: new Date(),
    },
    update: {
      username: data.username,
      businessAccountId: data.igUserId,
      accessToken: data.accessToken,
      tokenExpiresAt: data.tokenExpiresAt,
      isConnected: true,
      lastVerifiedAt: new Date(),
    },
  });

  return toFeatureShape(row);
}

/**
 * Returns the real, unmasked access token for a user — for server-side use
 * only (e.g. actually calling Meta's API to verify a connection). Never
 * expose this value to the client.
 */
export async function getRawAccessToken(userId: string): Promise<string | null> {
  const row = await prisma.instagramSettings.findUnique({
    where: { userId },
    select: { accessToken: true },
  });
  return row?.accessToken ?? null;
}

/**
 * Routes an inbound webhook to the right tenant: Meta sends the receiving
 * IG professional account's id as `entry[].id`, which we stored as
 * `businessAccountId` when the owner connected their account.
 */
export async function findUserIdByIgBusinessAccountId(igBusinessAccountId: string): Promise<string | null> {
  const row = await prisma.instagramSettings.findUnique({
    where: { businessAccountId: igBusinessAccountId },
    select: { userId: true },
  });
  return row?.userId ?? null;
}
