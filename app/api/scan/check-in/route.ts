// app/api/scan/check-in/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';
import { verifyCheckInToken } from '@/lib/checkin-qr';
import { getCheckInWindow } from '@/lib/check-in-window';
import { performCheckIn } from '@/lib/perform-check-in';

const scanSchema = z.object({
  token: z.string().min(10).max(200),
});

function timeLabel(date: Date) {
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  });
}

function fail(code: string, message: string, status: number, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ ok: false, code, message, ...extra }, { status });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return fail('UNAUTHORIZED', 'Tidak diizinkan', 401);
  }

  if (session.user.role === 'MEMBER') {
    const member = await prisma.member.findUnique({
      where: { id: session.user.id },
      select: { isStaff: true },
    });

    if (!member?.isStaff) {
      return fail('FORBIDDEN', 'Kamu bukan panitia', 403);
    }
  }

  const { success } = rateLimit(`scan:${session.user.id}`, { limit: 90, windowMs: 60 * 1000 });

  if (!success) {
    return fail('RATE_LIMITED', 'Terlalu cepat, tunggu sebentar', 429);
  }

  const parsed = scanSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return fail('INVALID_QR', 'QR tidak valid', 400);
  }

  const registrationId = verifyCheckInToken(parsed.data.token);

  if (!registrationId) {
    return fail('INVALID_QR', 'QR tidak valid', 400);
  }

  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: {
      event: true,
      member: { select: { name: true, avatarUrl: true } },
    },
  });

  if (!registration) {
    return fail('NOT_FOUND', 'Pendaftaran tidak ditemukan', 404);
  }

  const person = { name: registration.member.name, avatarUrl: registration.member.avatarUrl };
  const eventName = registration.event.name;

  if (registration.status === 'CHECKED_IN') {
    const at = registration.checkedInAt ? ` pukul ${timeLabel(registration.checkedInAt)}` : '';
    return fail('ALREADY_CHECKED_IN', `Sudah check-in${at}`, 409, { member: person, eventName });
  }

  if (registration.paymentStatus !== 'VERIFIED') {
    return fail('PAYMENT_NOT_VERIFIED', 'Pembayaran belum terverifikasi', 403, { member: person, eventName });
  }

  const now = new Date();
  const { opensAt, closesAt } = getCheckInWindow(registration.event);

  if (now < opensAt) {
    return fail('NOT_OPEN', `Check-in dibuka pukul ${timeLabel(opensAt)}`, 400, { member: person, eventName });
  }

  if (now > closesAt) {
    return fail('CLOSED', 'Waktu check-in sudah ditutup', 400, { member: person, eventName });
  }

  const result = await performCheckIn(registration.id);

  if (!result) {
    return fail('ALREADY_CHECKED_IN', 'Sudah check-in', 409, { member: person, eventName });
  }

  return NextResponse.json({
    ok: true,
    member: person,
    eventName,
    attendedCount: result.attendedCount,
    newBadge: result.newBadge,
  });
}
