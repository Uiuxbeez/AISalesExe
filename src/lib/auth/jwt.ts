import { SignJWT, jwtVerify } from "jose";
import type { SessionPayload } from "@/features/auth/types";

const SESSION_DURATION = "8h";

function getSecretKey() {
  const secret = process.env.JWT_SECRET ?? "dev-only-secret-change-me";
  return new TextEncoder().encode(secret);
}

/** Sign a session payload into a compact JWT string. */
export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(getSecretKey());
}

/** Verify a session JWT, returning its payload or null if invalid/expired. */
export async function verifySession(
  token: string | undefined
): Promise<SessionPayload | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (typeof payload.email !== "string" || typeof payload.name !== "string") {
      return null;
    }
    return { email: payload.email, name: payload.name };
  } catch {
    return null;
  }
}
