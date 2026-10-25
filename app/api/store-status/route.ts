// app/api/store-status/route.ts
import { NextResponse } from 'next/server';
import { getStoreSettings } from '@/lib/store-settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { ordersOpen, currentBatch } = await getStoreSettings();
  return NextResponse.json({ ordersOpen, currentBatch });
}
