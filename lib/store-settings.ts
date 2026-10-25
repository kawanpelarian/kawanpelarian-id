// lib/store-settings.ts
import { prisma } from '@/lib/prisma';

// Satu baris setting global dengan id tetap "main". Kalau barisnya belum
// pernah dibuat, dianggap pre-order dibuka di batch 1 (default aman, gak
// ngunci toko gara-gara belum ada data).
export const STORE_SETTING_ID = 'main';

export interface StoreSettings {
  ordersOpen: boolean;
  currentBatch: number;
}

export async function getStoreSettings(): Promise<StoreSettings> {
  const setting = await prisma.storeSetting.findUnique({
    where: { id: STORE_SETTING_ID },
  });

  return {
    ordersOpen: setting?.ordersOpen ?? true,
    currentBatch: setting?.currentBatch ?? 1,
  };
}

export async function getOrdersOpen(): Promise<boolean> {
  return (await getStoreSettings()).ordersOpen;
}
