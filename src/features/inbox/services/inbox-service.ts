import { getConversationsForUser, sendReplyToConversation } from "@/features/inbox/repositories/inbox-repository";
import { getCurrentUser } from "@/lib/auth/current-user";
import { formatClockTime, formatRelativeLabel } from "@/lib/format-time";
import type { Conversation, ConversationStatus, Message, MessageSender } from "@/features/inbox/types";

type ConversationRow = Awaited<ReturnType<typeof getConversationsForUser>>[number];
type MessageRow = ConversationRow["messages"][number];

/**
 * Phase 2: reads real Conversation/Message rows populated by the Instagram
 * webhook receiver, replacing the Phase 1 mock data. Returns an empty list
 * until the first DM arrives — that's the expected state right after
 * connecting Instagram and before anyone has messaged the account.
 */
export async function fetchConversations(): Promise<Conversation[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const rows = await getConversationsForUser(user.id);

  return rows.map((row: ConversationRow) => {
    const lastMessage = row.messages[row.messages.length - 1];

    return {
      id: row.id,
      customerName: row.customerName,
      customerHandle: row.customerHandle ?? "",
      lastMessagePreview: lastMessage?.content ?? "",
      lastMessageAt: row.lastMessageAt ? formatRelativeLabel(row.lastMessageAt) : formatRelativeLabel(row.createdAt),
      status: row.status as ConversationStatus,
      // Read/unread tracking isn't modeled yet — deferred past Phase 2.
      unreadCount: 0,
      messages: row.messages.map((message: MessageRow) => ({
        id: message.id,
        sender: message.sender as MessageSender,
        content: message.content,
        timestamp: formatClockTime(message.createdAt),
      })),
    };
  });
}

/** Sends a manual reply from the current user's connected Instagram account. Throws on failure. */
export async function sendReply(conversationId: string, text: string): Promise<Message> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const trimmed = text.trim();
  if (!trimmed) throw new Error("Message can't be empty");

  const message = await sendReplyToConversation(user.id, conversationId, trimmed);

  return {
    id: message.id,
    sender: message.sender as MessageSender,
    content: message.content,
    timestamp: formatClockTime(message.createdAt),
  };
}
