import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * One-time migration: your Neon database already has a `users` row from
 * Phase 1 with a *plaintext* password ("password123"). Now that login
 * compares against bcrypt hashes, that row needs to be rehashed once —
 * otherwise the existing admin@example.com account will be locked out.
 *
 * Safe to run more than once: a value that's already a bcrypt hash
 * (starts with "$2") is skipped.
 *
 * Run with: npx tsx scripts/rehash-existing-passwords.ts
 */
async function main() {
  const users = await prisma.user.findMany();
  let updated = 0;

  for (const user of users) {
    if (user.password.startsWith("$2")) continue; // already hashed

    const hashed = await bcrypt.hash(user.password, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
    updated += 1;
    console.log(`Rehashed password for ${user.email}`);
  }

  console.log(updated > 0 ? `Done. ${updated} account(s) rehashed.` : "Nothing to do — all passwords already hashed.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
