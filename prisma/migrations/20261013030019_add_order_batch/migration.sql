-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "batch" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "store_settings" ADD COLUMN     "currentBatch" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "orders_batch_idx" ON "orders"("batch");
