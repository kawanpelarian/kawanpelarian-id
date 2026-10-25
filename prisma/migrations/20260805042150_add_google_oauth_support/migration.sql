-- AlterTable
ALTER TABLE "members" ADD COLUMN     "birthDate" TIMESTAMP(3),
ALTER COLUMN "phone" DROP NOT NULL,
ALTER COLUMN "password" DROP NOT NULL;
