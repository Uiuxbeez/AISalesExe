import { prisma } from "@/lib/db/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import type {
  AccountInfo,
  ChangePasswordInput,
  ChangePasswordResult,
} from "@/features/account/types";

export async function getAccountInfo(userId: string): Promise<AccountInfo> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { email: true, name: true, businessName: true, createdAt: true },
  });

  return {
    email: user.email,
    name: user.name ?? "",
    businessName: user.businessName ?? "",
    memberSince: user.createdAt.toISOString(),
  };
}

export async function changePassword(
  userId: string,
  input: ChangePasswordInput
): Promise<ChangePasswordResult> {
  if (input.newPassword.length < 8) {
    return { success: false, error: "New password must be at least 8 characters." };
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const currentMatches = await verifyPassword(input.currentPassword, user.password);

  if (!currentMatches) {
    return { success: false, error: "Current password is incorrect." };
  }

  const hashed = await hashPassword(input.newPassword);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });

  return { success: true };
}
