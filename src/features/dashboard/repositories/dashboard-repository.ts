import type { DashboardStats } from "@/features/dashboard/types";

/**
 * Stands in for the future database-backed repository. Once Instagram,
 * AI, and webhook data are real, this is the only file that needs to
 * change — swap the mock object for Prisma queries.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  return {
    instagramStatus: "disconnected",
    aiStatus: "inactive",
    webhookStatus: "offline",
    conversationCount: 128,
    latestActivity: [
      { id: "1", message: "New conversation started with @jane.doe", timestamp: "2 minutes ago" },
      { id: "2", message: "AI Brain settings updated", timestamp: "1 hour ago" },
      { id: "3", message: "Conversation with @mark.retail marked as closed", timestamp: "3 hours ago" },
      { id: "4", message: "New conversation started with @lucy.shops", timestamp: "Yesterday" },
      { id: "5", message: "Instagram connection check failed", timestamp: "Yesterday" },
    ],
  };
}
