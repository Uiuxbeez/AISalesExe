import { prisma } from "@/lib/db/prisma";
import { getRawAccessToken } from "@/features/settings/repositories/settings-repository";
import { sendInstagramMessage } from "@/lib/instagram/oauth";

export async function getConversationsForUser(userId: string) {
  return prisma.conversation.findMany({
    where: { userId },
    orderBy: { lastMessageAt: "desc" },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
}

/**
 * Sends a reply through Instagram's Send API, then persists it as an
 * "agent" message on success. Throws if the conversation doesn't belong
 * to this user, has no Instagram sender to reply to, or if Instagram
 * isn't connected — callers should surface these as user-facing errors
 * rather than silently failing.
 */
export async function sendReplyToConversation(userId: string, conversationId: string, text: string) {
  const [conversation, instagramSettings] = await Promise.all([
    prisma.conversation.findUnique({ where: { id: conversationId } }),
    prisma.instagramSettings.findUnique({ where: { userId } }),
  ]);

  if (!conversation || conversation.userId !== userId) {
    throw new Error("Conversation not found");
  }
  if (!conversation.instagramSenderId) {
    throw new Error("This conversation has no Instagram sender to reply to");
  }
  if (!instagramSettings?.isConnected || !instagramSettings.businessAccountId) {
    throw new Error("Instagram is not connected");
  }

  const accessToken = await getRawAccessToken(userId);
  if (!accessToken) {
    throw new Error("No Instagram access token stored");
  }

  await sendInstagramMessage(
    instagramSettings.businessAccountId,
    accessToken,
    conversation.instagramSenderId,
    text
  );

  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: { conversationId, sender: "agent", content: text },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    }),
  ]);

  return message;
}
