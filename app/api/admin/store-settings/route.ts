// app/api/admin/store-settings/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';
import { STORE_SETTING_ID } from '@/lib/store-settings';
import { z } from 'zod';

// Dua aksi: set buka/tutup (nilai eksplisit), atau mulai batch baru
const schema = z.union([z.object({ ordersOpen: z.boolean() }), z.object({ startNewBatch: z.literal(true) })]);

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  const { success } = rateLimit(`admin-store-settings:${session.user.id}`, {
    limit: 20,
    windowMs: 60 * 1000,
  });

  if (!success) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan, coba lagi sebentar' }, { status: 429 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Data gak valid' }, { status: 400 });
  }

  if ('startNewBatch' in parsed.data) {
    // Batch baru cuma boleh dimulai kalau pre-order lagi ditutup, biar
    // pesanan batch yang sedang berjalan gak kepotong di tengah
    const current = await prisma.storeSetting.findUnique({ where: { id: STORE_SETTING_ID } });

    if (current?.ordersOpen ?? true) {
      return NextResponse.json({ error: 'Tutup pre-order batch ini dulu sebelum mulai batch baru' }, { status: 400 });
    }

    const setting = await prisma.storeSetting.update({
      where: { id: STORE_SETTING_ID },
      data: { currentBatch: { increment: 1 }, ordersOpen: true },
    });

    return NextResponse.json({
      message: `Batch ${setting.currentBatch} dimulai, pre-order dibuka`,
      ordersOpen: setting.ordersOpen,
      currentBatch: setting.currentBatch,
    });
  }

  // Nilai eksplisit (bukan toggle), biar klik ganda gak bikin statusnya
  // kebalik dari yang dimaksud admin
  const setting = await prisma.storeSetting.upsert({
    where: { id: STORE_SETTING_ID },
    update: { ordersOpen: parsed.data.ordersOpen },
    create: { id: STORE_SETTING_ID, ordersOpen: parsed.data.ordersOpen },
  });

  return NextResponse.json({
    message: setting.ordersOpen ? 'Pre-order dibuka' : 'Pre-order ditutup',
    ordersOpen: setting.ordersOpen,
    currentBatch: setting.currentBatch,
  });
}
