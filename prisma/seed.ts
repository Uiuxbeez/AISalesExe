import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Phase 1 seed: a single dummy account.
 * Password is stored in plain text intentionally for this phase only —
 * real hashing will be introduced alongside real authentication in a
 * later phase.
 */
async function main() {
  const user = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      password: "password123",
      name: "Admin",
      instagramSettings: {
        create: {
          username: "myshop.official",
          businessAccountId: "1784900000000123",
          accessToken: null,
          isConnected: false,
        },
      },
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
