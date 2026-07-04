import type { LoginInput, LoginResult } from "@/features/auth/types";

/**
 * Phase 1 has exactly one account and no registration flow, so
 * credentials are checked against a fixed pair rather than the database.
 * Swapping this for a real user lookup + password hash check is a
 * drop-in change for a later phase.
 */
const DUMMY_ACCOUNT = {
  email: "admin@example.com",
  password: "password123",
  name: "Admin",
};

export function validateCredentials(input: LoginInput): LoginResult {
  const emailMatches =
    input.email.trim().toLowerCase() === DUMMY_ACCOUNT.email;
  const passwordMatches = input.password === DUMMY_ACCOUNT.password;

  if (emailMatches && passwordMatches) {
    return { success: true };
  }

  return { success: false, error: "Invalid email or password." };
}

export function getDummyAccountName(): string {
  return DUMMY_ACCOUNT.name;
}
