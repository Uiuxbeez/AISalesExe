import { INSTAGRAM_GRAPH_URL } from "@/lib/instagram/config";

/**
 * Diagnostic-only: attempts to fetch the list of existing conversations
 * for an Instagram professional account via the Graph API. This endpoint
 * is well-documented for the Facebook-Page-linked Graph API, but its
 * availability for the (Page-less) "Instagram API with Instagram Login"
 * flow this app uses is not clearly confirmed in Meta's docs — this
 * function exists purely to get a real, first-party answer instead of
 * guessing from documentation.
 *
 * Tries a few query variations in one shot, since an empty `data: []`
 * with a 200 status is ambiguous between "genuinely no conversations"
 * and "missing a parameter Meta needs to actually return results".
 */
export async function fetchInstagramConversationsRaw(
  igUserId: string,
  accessToken: string
): Promise<Record<string, { status: number; ok: boolean; body: unknown }>> {
  async function call(label: string, params: Record<string, string>) {
    const url = new URL(`${INSTAGRAM_GRAPH_URL}/${igUserId}/conversations`);
    url.searchParams.set("access_token", accessToken);
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);

    const response = await fetch(url.toString());
    const body = await response.json().catch(() => null);
    return [label, { status: response.status, ok: response.ok, body }] as const;
  }

  const results = await Promise.all([
    call("bare", {}),
    call("with_platform", { platform: "instagram" }),
    call("with_fields", { fields: "participants,updated_time,messages{message,from,to,created_time}" }),
    call("with_platform_and_fields", {
      platform: "instagram",
      fields: "participants,updated_time,messages{message,from,to,created_time}",
    }),
  ]);

  return Object.fromEntries(results);
}

