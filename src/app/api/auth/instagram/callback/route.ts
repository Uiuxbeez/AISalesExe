import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import {
  exchangeCodeForShortLivedToken,
  exchangeForLongLivedToken,
  fetchInstagramProfile,
} from "@/lib/instagram/oauth";
import { saveInstagramSettingsFromOAuth } from "@/features/settings/repositories/settings-repository";
import { OAUTH_STATE_COOKIE_NAME } from "@/lib/instagram/config";

function settingsRedirect(request: NextRequest, params: Record<string, string>) {
  const url = new URL("/settings", request.url);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { searchParams } = request.nextUrl;
  const error = searchParams.get("error");
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const expectedState = request.cookies.get(OAUTH_STATE_COOKIE_NAME)?.value;

  // The user denied the permissions dialog.
  if (error) {
    return settingsRedirect(request, { instagram_error: "access_denied" });
  }

  if (!code || !state || !expectedState || state !== expectedState) {
    return settingsRedirect(request, { instagram_error: "invalid_state" });
  }

  try {
    const { accessToken: shortLivedToken } = await exchangeCodeForShortLivedToken(code);
    const { accessToken: longLivedToken, expiresInSeconds } = await exchangeForLongLivedToken(shortLivedToken);
    const profile = await fetchInstagramProfile(longLivedToken);

    await saveInstagramSettingsFromOAuth(user.id, {
      username: profile.username,
      igUserId: profile.userId,
      accessToken: longLivedToken,
      tokenExpiresAt: new Date(Date.now() + expiresInSeconds * 1000),
    });

    const response = settingsRedirect(request, { instagram_connected: "1" });
    response.cookies.delete(OAUTH_STATE_COOKIE_NAME);
    return response;
  } catch (err) {
    console.error("Instagram OAuth callback failed:", err);
    return settingsRedirect(request, { instagram_error: "connection_failed" });
  }
}
