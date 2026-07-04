-- Phase 2: Instagram OAuth + webhook receiving

-- AlterTable: instagram_settings gains a token expiry, and businessAccountId
-- becomes unique so an inbound webhook's entry.id can look up the tenant.
ALTER TABLE "instagram_settings" ADD COLUMN "tokenExpiresAt" TIMESTAMP(3);

-- AlterTable: conversations gains the Instagram-scoped sender id used to
-- find-or-create a thread for an inbound DM.
ALTER TABLE "conversations" ADD COLUMN "instagramSenderId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "instagram_settings_businessAccountId_key" ON "instagram_settings"("businessAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_userId_instagramSenderId_key" ON "conversations"("userId", "instagramSenderId");
