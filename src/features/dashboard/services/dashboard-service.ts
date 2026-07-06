import { getDashboardStats } from "@/features/dashboard/repositories/dashboard-repository";
import type { DashboardStats } from "@/features/dashboard/types";
import { getCurrentUser } from "@/lib/auth/current-user";

const EMPTY_STATS: DashboardStats = {
  instagramStatus: "disconnected",
  aiStatus: "inactive",
  webhookStatus: "offline",
  conversationCount: 0,
  latestActivity: [],
};

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const user = await getCurrentUser();
  if (!user) return EMPTY_STATS;
  return getDashboardStats(user.id);
}
