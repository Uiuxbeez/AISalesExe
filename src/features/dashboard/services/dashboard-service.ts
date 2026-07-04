import { getDashboardStats } from "@/features/dashboard/repositories/dashboard-repository";
import type { DashboardStats } from "@/features/dashboard/types";

export async function fetchDashboardStats(): Promise<DashboardStats> {
  return getDashboardStats();
}
