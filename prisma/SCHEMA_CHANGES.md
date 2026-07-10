# Schema change needed for Phase 3

Add a `businessName` field to the `User` model in `prisma/schema.prisma`:

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  password     String
  name         String?
  businessName String?          // <-- add this line
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  instagramSettings InstagramSettings?
  aiSettings        AISettings?
  conversations     Conversation[]
  webhookLogs       WebhookLog[]

  @@map("users")
}
```

Then run:

```bash
npx prisma migrate dev --name add-business-name
```

This is additive and nullable, so it's safe to run against your existing Neon database —
it won't touch any existing rows or Instagram/AI settings data.
