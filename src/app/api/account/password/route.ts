import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { changePassword } from "@/features/account/services/account-service";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body.currentPassword !== "string" || typeof body.newPassword !== "string") {
    return NextResponse.json(
      { success: false, error: "Both current and new password are required." },
      { status: 400 }
    );
  }

  const result = await changePassword(user.id, {
    currentPassword: body.currentPassword,
    newPassword: body.newPassword,
  });

  if (!result.success) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result);
}
