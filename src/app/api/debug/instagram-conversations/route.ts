import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getInstagramSettings, getRawAccessToken } from "@/features/settings/repositories/settings-repository";
import { fetchInstagramConversationsRaw } from "@/lib/instagram/conversations";

/**
 * Diagnostic-only route: calls Meta's conversations-list endpoint with the
 * real stored token and returns Meta's raw response verbatim. Gated behind
 * login since it touches a real access token server-side (the token itself
 * is never returned to the client).
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await getInstagramSettings(user.id);
  if (!settings.isConnected || !settings.businessAccountId) {
    return NextResponse.json({ error: "Instagram is not connected" }, { status: 400 });
  }

  const accessToken = await getRawAccessToken(user.id);
  if (!accessToken) {
    return NextResponse.json({ error: "No access token stored" }, { status: 400 });
  }

  try {
    const result = await fetchInstagramConversationsRaw(settings.businessAccountId, accessToken);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: "Request to Meta failed", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
