import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  fetchAIBrainSettings,
  updateAIBrainSettings,
} from "@/features/ai-brain/services/ai-brain-service";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await fetchAIBrainSettings();
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
    typeof body.openAiApiKey !== "string" ||
    typeof body.temperature !== "number" ||
    typeof body.maxTokens !== "number" ||
    typeof body.systemPrompt !== "string"
  ) {
    return NextResponse.json({ error: "Invalid AI Brain settings payload." }, { status: 400 });
  }

  const updated = await updateAIBrainSettings(body);
  return NextResponse.json(updated);
}
