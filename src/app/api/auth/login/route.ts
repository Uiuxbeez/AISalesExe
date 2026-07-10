import { NextRequest, NextResponse } from "next/server";
import { validateCredentials } from "@/features/auth/services/auth-service";
import { createSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body.email !== "string" || typeof body.password !== "string") {
    return NextResponse.json(
      { success: false, error: "Email and password are required." },
      { status: 400 }
    );
  }

  const result = await validateCredentials({ email: body.email, password: body.password });

  if (!result.success) {
    return NextResponse.json(result, { status: 401 });
  }

  await createSession({ email: body.email.trim().toLowerCase(), name: result.name });

  return NextResponse.json({ success: true });
}
