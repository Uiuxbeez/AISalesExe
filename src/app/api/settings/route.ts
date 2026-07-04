import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  fetchInstagramSettings,
  updateInstagramSettings,
} from "@/features/settings/services/settings-service";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await fetchInstagramSettings();
  return NextResponse.json(settings);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  if (
    !body ||
    typeof body.username !== "string" ||
    typeof body.businessAccountId !== "string" ||
    typeof body.accessToken !== "string"
  ) {
    return NextResponse.json({ error: "Invalid Instagram settings payload." }, { status: 400 });
  }

  const updated = await updateInstagramSettings({
    username: body.username,
    businessAccountId: body.businessAccountId,
    accessToken: body.accessToken,
  });

  return NextResponse.json(updated);
}
