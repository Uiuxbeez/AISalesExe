import { prisma } from "@/lib/db/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import type { LoginInput, LoginResult, SignupInput, SignupResult } from "@/features/auth/types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Phase 3: real multi-tenant auth. Each business gets its own User row;
 * every Instagram connection, AI Brain config, and conversation set is
 * scoped to that row's id. Replaces the Phase 1 single hardcoded account.
 */
export async function validateCredentials(input: LoginInput): Promise<LoginResult> {
  const email = input.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Same message as a wrong password — don't reveal whether the email exists.
    return { success: false, error: "Invalid email or password." };
  }

  const passwordMatches = await verifyPassword(input.password, user.password);
  if (!passwordMatches) {
    return { success: false, error: "Invalid email or password." };
  }

  return { success: true, name: user.name ?? "" };
}

export async function createUser(input: SignupInput): Promise<SignupResult> {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  const businessName = input.businessName.trim();

  if (!EMAIL_PATTERN.test(email)) {
    return { success: false, error: "Enter a valid email address." };
  }
  if (input.password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters." };
  }
  if (!name) {
    return { success: false, error: "Enter your name." };
  }
  if (!businessName) {
    return { success: false, error: "Enter your business name." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: "An account with this email already exists." };
  }

  const hashed = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      name,
      businessName,
    },
  });

  return { success: true, name: user.name ?? "", email: user.email };
}
