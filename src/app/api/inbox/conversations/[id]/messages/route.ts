import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { sendReply } from "@/features/inbox/services/inbox-service";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text : "";

  if (!text.trim()) {
    return NextResponse.json({ error: "Message can't be empty" }, { status: 400 });
  }

  try {
    const message = await sendReply(id, text);
    return NextResponse.json(message);
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Failed to send message";
    return NextResponse.json({ error: detail }, { status: 400 });
  }
}
