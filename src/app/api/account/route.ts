import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getAccountInfo } from "@/features/account/services/account-service";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const info = await getAccountInfo(user.id);
  return NextResponse.json(info);
}
