import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db/prisma";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.instagramSettings.updateMany({
    where: { userId: user.id },
    data: {
      accessToken: null,
      tokenExpiresAt: null,
      isConnected: false,
      lastVerifiedAt: null,
      businessAccountId: null,
      username: null,
    },
  });

  return NextResponse.json({ success: true });
}
