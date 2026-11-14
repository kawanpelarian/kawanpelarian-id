// app/api/attendance/check-in/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';
import { getCheckInWindow } from '@/lib/check-in-window';
import { performCheckIn } from '@/lib/perform-check-in';

const checkInSchema = z.object({
  eventId: z.string().min(1, 'Event wajib diisi'),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session || session.user.role !== 'MEMBER') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  const member = await prisma.member.findUnique({
    where: { id: session.user.id },
    select: { isStaff: true },
  });

  if (!member?.isStaff) {
    return NextResponse.json({ error: 'Check-in dilakukan lewat QR yang dipindai panitia' }, { status: 403 });
  }

  const { success } = rateLimit(`check-in:${session.user.id}`, { limit: 5, windowMs: 60 * 1000 });

  if (!success) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan, coba lagi sebentar' }, { status: 429 });
  }

  const parsed = checkInSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 });
  }

  const registration = await prisma.registration.findUnique({
    where: { memberId_eventId: { memberId: session.user.id, eventId: parsed.data.eventId } },
    include: { event: true },
  });

  if (!registration) {
    return NextResponse.json({ error: 'Kamu belum terdaftar di event ini' }, { status: 404 });
  }

  if (registration.status === 'CHECKED_IN') {
    return NextResponse.json({ error: 'Kamu sudah check-in sebelumnya' }, { status: 409 });
  }

  if (registration.paymentStatus !== 'VERIFIED') {
    return NextResponse.json({ error: 'Pembayaran kamu belum diverifikasi admin' }, { status: 403 });
  }

  const now = new Date();
  const { opensAt, closesAt } = getCheckInWindow(registration.event);

  if (now < opensAt) {
    return NextResponse.json({ error: 'Check-in dibuka 30 menit sebelum acara dimulai' }, { status: 400 });
  }

  if (now > closesAt) {
    return NextResponse.json({ error: 'Waktu check-in sudah ditutup' }, { status: 400 });
  }

  const result = await performCheckIn(registration.id);

  if (!result) {
    return NextResponse.json({ error: 'Kamu sudah check-in sebelumnya' }, { status: 409 });
  }

  return NextResponse.json({
    message: 'Check-in berhasil',
    attendedCount: result.attendedCount,
    newBadge: result.newBadge,
  });
}
