import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { instagramConfig } from "@/lib/instagram/config";
import { verifyInstagramWebhookSignature } from "@/lib/instagram/webhook-verify";
import { parseIncomingMessages, type InstagramWebhookPayload } from "@/lib/instagram/webhook-types";
import {
  findUserIdByIgBusinessAccountId,
  getRawAccessToken,
} from "@/features/settings/repositories/settings-repository";
import { fetchInstagramSenderProfile } from "@/lib/instagram/oauth";

const PLACEHOLDER_NAME_PREFIX = "Instagram user ";

/**
 * Meta's one-time verification handshake, run when you subscribe this URL
 * in the App Dashboard's Webhooks product. Must echo back `hub.challenge`
 * as plain text if `hub.verify_token` matches ours.
 * https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === instagramConfig.webhookVerifyToken && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

/**
 * Inbound DM delivery. No AI reply here by design — Phase 2 only proves
 * messages land: verify the request really came from Meta, log the raw
 * payload, and persist each customer message into Conversation/Message so
 * it shows up in the Inbox UI.
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");

  // Best-effort parse up front so a signature failure can still be logged
  // with whatever entry.id is present, instead of vanishing entirely.
  let payload: InstagramWebhookPayload | null = null;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    payload = null;
  }

  if (!verifyInstagramWebhookSignature(rawBody, signature)) {
    console.warn("Instagram webhook: signature verification failed");

    const firstEntryId = payload?.entry?.[0]?.id ?? null;
    const routedUserId = firstEntryId ? await findUserIdByIgBusinessAccountId(firstEntryId) : null;

    await prisma.webhookLog.create({
      data: {
        userId: routedUserId,
        source: "instagram",
        // Never log the signature header itself — it's derived from the
        // app secret and not something that needs to persist anywhere.
        payload: (payload as unknown as object) ?? { note: "signature invalid, body was not valid JSON" },
        status: "signature_failed",
      },
    });

    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (!payload) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const incomingMessages = parseIncomingMessages(payload);

  // Log every delivery — including ones with nothing actionable in them
  // (echoes, read receipts, etc.) — so the pipeline is inspectable while
  // debugging the connection.
  const firstEntryId = payload.entry?.[0]?.id ?? null;
  const routedUserId = firstEntryId ? await findUserIdByIgBusinessAccountId(firstEntryId) : null;

  await prisma.webhookLog.create({
    data: {
      userId: routedUserId,
      source: "instagram",
      payload: payload as unknown as object,
      status: incomingMessages.length > 0 ? "received" : "processed",
    },
  });

  for (const message of incomingMessages) {
    const userId = await findUserIdByIgBusinessAccountId(message.igBusinessAccountId);

    if (!userId) {
      console.warn(
        `Instagram webhook: no connected user for IG business account ${message.igBusinessAccountId}, dropping message`
      );
      continue;
    }

    const conversation = await prisma.conversation.upsert({
      where: {
        userId_instagramSenderId: { userId, instagramSenderId: message.senderIgsid },
      },
      create: {
        userId,
        instagramSenderId: message.senderIgsid,
        // Placeholder until the profile lookup below (best-effort) fills
        // in a real name — kept distinct enough to detect and retry later
        // if that lookup fails here.
        customerName: `${PLACEHOLDER_NAME_PREFIX}${message.senderIgsid.slice(-6)}`,
        customerHandle: null,
        lastMessageAt: message.createdAt,
        status: "open",
      },
      update: {
        lastMessageAt: message.createdAt,
        status: "open",
      },
    });

    // Best-effort real-name lookup. Only attempted while the conversation
    // still has a placeholder name, so it self-heals on a later message if
    // it failed before (e.g. transient error) without needing a separate
    // backfill script. Never blocks message processing if it fails.
    if (conversation.customerName.startsWith(PLACEHOLDER_NAME_PREFIX)) {
      try {
        const accessToken = await getRawAccessToken(userId);
        if (accessToken) {
          const profile = await fetchInstagramSenderProfile(message.senderIgsid, accessToken);
          if (profile.username || profile.name) {
            await prisma.conversation.update({
              where: { id: conversation.id },
              data: {
                customerName: profile.name ?? profile.username ?? conversation.customerName,
                customerHandle: profile.username ? `@${profile.username}` : null,
              },
            });
          }
        }
      } catch (err) {
        console.warn(`Instagram webhook: couldn't fetch sender profile for ${message.senderIgsid}:`, err);
      }
    }

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        sender: "customer",
        content: message.content,
        createdAt: message.createdAt,
      },
    });
  }

  // Meta requires a fast 200 response regardless of what you did with the
  // payload, or it will retry (and eventually stop) delivering.
  return NextResponse.json({ success: true });
}
