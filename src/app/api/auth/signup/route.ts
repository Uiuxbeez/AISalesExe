import { NextRequest, NextResponse } from "next/server";
import { createUser } from "@/features/auth/services/auth-service";
import { createSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (
    !body ||
    typeof body.name !== "string" ||
    typeof body.businessName !== "string" ||
    typeof body.email !== "string" ||
    typeof body.password !== "string"
  ) {
    return NextResponse.json(
      { success: false, error: "All fields are required." },
      { status: 400 }
    );
  }

  const result = await createUser({
    name: body.name,
    businessName: body.businessName,
    email: body.email,
    password: body.password,
  });

  if (!result.success) {
    return NextResponse.json(result, { status: 400 });
  }

  // Log the new tenant straight in — no separate login step needed.
  await createSession({ email: result.email, name: result.name });

  return NextResponse.json({ success: true });
}
