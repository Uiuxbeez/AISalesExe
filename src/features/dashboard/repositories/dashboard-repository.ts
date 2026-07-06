import { prisma } from "@/lib/db/prisma";
import type { DashboardStats } from "@/features/dashboard/types";
import { formatRelativeLabel } from "@/lib/format-time";

/**
 * Phase 2: Instagram/webhook status and conversation counts are now real,
 * pulled from the same instagram_settings/conversations/messages tables the
 * Settings and Inbox pages use. AI Brain remains genuinely unbuilt (Phase
 * 3+), so its status is still a fixed "inactive" rather than a fake mock
 * value pretending otherwise.
 */
export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const [instagramSettings, conversationCount, recentMessages] = await Promise.all([
    prisma.instagramSettings.findUnique({ where: { userId } }),
    prisma.conversation.count({ where: { userId } }),
    prisma.message.findMany({
      where: { conversation: { userId } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { conversation: { select: { customerName: true } } },
    }),
  ]);

  const isConnected = instagramSettings?.isConnected ?? false;
  type RecentMessage = (typeof recentMessages)[number];

  return {
    instagramStatus: isConnected ? "connected" : "disconnected",
    aiStatus: "inactive",
    // Mirrors the Instagram connection rather than message throughput —
    // this reflects whether the receiving pipeline is active for this
    // account, not how recently a customer has messaged.
    webhookStatus: isConnected ? "live" : "offline",
    conversationCount,
    latestActivity: recentMessages.map((message: RecentMessage) => ({
      id: message.id,
      message:
        message.sender === "customer"
          ? `New message from ${message.conversation.customerName}`
          : `Message sent to ${message.conversation.customerName}`,
      timestamp: formatRelativeLabel(message.createdAt),
    })),
  };
}
