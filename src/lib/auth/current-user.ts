import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";

/**
 * The session JWT only carries { email, name } (Phase 1 dummy auth).
 * Repositories need a real userId for Prisma queries, so this resolves
 * the current session back to its User row.
 */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  return prisma.user.findUnique({ where: { email: session.email } });
}
