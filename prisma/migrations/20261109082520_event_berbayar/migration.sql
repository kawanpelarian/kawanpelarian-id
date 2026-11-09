-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "price" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "registrations" ADD COLUMN     "amountPaid" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "paymentRejectReason" TEXT,
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'VERIFIED',
ADD COLUMN     "proofUrl" TEXT;

-- CreateIndex
CREATE INDEX "registrations_eventId_paymentStatus_idx" ON "registrations"("eventId", "paymentStatus");
