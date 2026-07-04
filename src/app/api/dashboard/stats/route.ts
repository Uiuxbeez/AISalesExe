import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { fetchDashboardStats } from "@/features/dashboard/services/dashboard-service";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stats = await fetchDashboardStats();
  return NextResponse.json(stats);
}
