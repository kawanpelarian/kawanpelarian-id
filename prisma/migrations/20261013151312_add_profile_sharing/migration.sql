/*
  Warnings:

  - A unique constraint covering the columns `[shareCode]` on the table `members` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "members" ADD COLUMN     "isSharingEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shareCode" TEXT;

-- CreateTable
CREATE TABLE "profile_views" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "viewerHash" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_views_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "profile_views_memberId_createdAt_idx" ON "profile_views"("memberId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "profile_views_memberId_viewerHash_day_key" ON "profile_views"("memberId", "viewerHash", "day");

-- CreateIndex
CREATE UNIQUE INDEX "members_shareCode_key" ON "members"("shareCode");

-- AddForeignKey
ALTER TABLE "profile_views" ADD CONSTRAINT "profile_views_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
