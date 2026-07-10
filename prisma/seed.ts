import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Phase 3: the dummy account is now a real, hashed-password tenant like
 * any other signup — it's just pre-seeded so there's always one account
 * to test with.
 */
async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      password: hashedPassword,
      name: "Admin",
      businessName: "Demo Business",
      aiSettings: {
        create: {
          temperature: 0.7,
          maxTokens: 512,
          systemPrompt:
            "You are a friendly, knowledgeable sales executive for our Instagram shop. Keep replies short, warm, and helpful.",
        },
      },
    },
  });

  console.log(`Seeded user: ${user.email}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
