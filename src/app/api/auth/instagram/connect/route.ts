import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { buildInstagramAuthorizationUrl } from "@/lib/instagram/oauth";
import { OAUTH_STATE_COOKIE_NAME } from "@/lib/instagram/config";

/**
 * Kicks off the Instagram OAuth flow. Requires the user to already be
 * logged into the app (this connects *their* Instagram account to *their*
 * dashboard user).
 */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));
  }

  const state = randomBytes(24).toString("hex");
  const authorizationUrl = buildInstagramAuthorizationUrl(state);

  const response = NextResponse.redirect(authorizationUrl);

  // Short-lived, httpOnly cookie so the callback can confirm this request
  // round-trip actually originated here (CSRF protection for the OAuth flow).
  response.cookies.set(OAUTH_STATE_COOKIE_NAME, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10, // 10 minutes
  });

  return response;
}
