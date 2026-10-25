-- AlterTable
ALTER TABLE "members" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "instagram" TEXT,
ADD COLUMN     "isProfileHidden" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "strava" TEXT,
ADD COLUMN     "tiktok" TEXT;
