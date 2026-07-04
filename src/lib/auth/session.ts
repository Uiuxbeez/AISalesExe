import { cookies } from "next/headers";
import { signSession, verifySession } from "@/lib/auth/jwt";
import type { SessionPayload } from "@/features/auth/types";

export const SESSION_COOKIE_NAME = "ase_session";

/** Create the session JWT and write it to an httpOnly cookie. */
export async function createSession(payload: SessionPayload) {
  const token = await signSession(payload);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });
}

/** Read and verify the current session, if any, from the request cookies. */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return verifySession(token);
}

/** Clear the session cookie, logging the user out. */
export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
