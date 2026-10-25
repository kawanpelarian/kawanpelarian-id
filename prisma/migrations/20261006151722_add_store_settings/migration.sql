-- CreateTable
CREATE TABLE "store_settings" (
    "id" TEXT NOT NULL,
    "ordersOpen" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_settings_pkey" PRIMARY KEY ("id")
);
