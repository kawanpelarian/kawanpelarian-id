// app/api/admin/events/[id]/check-in/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getCheckInWindow, getDefaultCheckInClose } from '@/lib/check-in-window';

interface Params {
  params: Promise<{ id: string }>;
}

const MAX_EXTENSION_DAYS = 7;

const bodySchema = z.union([
  z.object({
    addMinutes: z
      .number()
      .int()
      .min(1)
      .max(MAX_EXTENSION_DAYS * 24 * 60),
  }),
  z.object({ until: z.string().min(1) }),
  z.object({ reset: z.literal(true) }),
]);

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  const { id } = await params;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 });
  }

  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Event tidak ditemukan' }, { status: 404 });
  }

  const defaultClose = getDefaultCheckInClose(existing.eventDate, existing.eventTime);
  const maxAllowed = new Date(defaultClose.getTime() + MAX_EXTENSION_DAYS * 24 * 60 * 60 * 1000);
  const data = parsed.data;

  let checkInUntil: Date | null;

  if ('reset' in data) {
    checkInUntil = null;
  } else if ('addMinutes' in data) {
    // Tambah dari batas check-in yang berlaku sekarang
    const { closesAt } = getCheckInWindow(existing);
    checkInUntil = new Date(closesAt.getTime() + data.addMinutes * 60 * 1000);
  } else {
    checkInUntil = new Date(data.until);
    if (Number.isNaN(checkInUntil.getTime())) {
      return NextResponse.json({ error: 'Format waktu tidak valid' }, { status: 400 });
    }
    if (checkInUntil <= defaultClose) {
      return NextResponse.json({ error: 'Batas check-in harus lebih lambat dari batas default (jam mulai + 2 jam)' }, { status: 400 });
    }
  }

  if (checkInUntil && checkInUntil > maxAllowed) {
    return NextResponse.json({ error: `Perpanjangan maksimal ${MAX_EXTENSION_DAYS} hari dari batas default` }, { status: 400 });
  }

  const event = await prisma.event.update({
    where: { id },
    data: { checkInUntil },
  });

  return NextResponse.json({
    message: checkInUntil ? 'Batas check-in diperpanjang' : 'Batas check-in dikembalikan ke default',
    event,
  });
}
