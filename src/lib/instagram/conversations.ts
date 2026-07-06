import { INSTAGRAM_GRAPH_URL } from "@/lib/instagram/config";

/**
 * Diagnostic-only: attempts to fetch the list of existing conversations
 * for an Instagram professional account via the Graph API. This endpoint
 * is well-documented for the Facebook-Page-linked Graph API, but its
 * availability for the (Page-less) "Instagram API with Instagram Login"
 * flow this app uses is not clearly confirmed in Meta's docs — this
 * function exists purely to get a real, first-party answer instead of
 * guessing from documentation.
 */
export async function fetchInstagramConversationsRaw(
  igUserId: string,
  accessToken: string
): Promise<{ status: number; ok: boolean; body: unknown }> {
  const url = new URL(`${INSTAGRAM_GRAPH_URL}/${igUserId}/conversations`);
  url.searchParams.set("access_token", accessToken);

  const response = await fetch(url.toString());
  const body = await response.json().catch(() => null);

  return { status: response.status, ok: response.ok, body };
}
