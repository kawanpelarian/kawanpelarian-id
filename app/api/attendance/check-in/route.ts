// app/api/attendance/check-in/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { resend } from '@/lib/resend';
import { getCheckInWindow } from '@/lib/check-in-window';
import { getCrossedBadge } from '@/lib/badges';
import { rateLimit } from '@/lib/rate-limit';
import { getCheckInEmailHtml } from '@/lib/email-templates';
import { z } from 'zod';

const checkInSchema = z.object({
  eventId: z.string().min(1, 'Event wajib diisi'),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session || session.user.role !== 'MEMBER') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  const { success } = rateLimit(`check-in:${session.user.id}`, {
    limit: 5,
    windowMs: 60 * 1000,
  });

  if (!success) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan, coba lagi sebentar' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = checkInSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Data tidak valid', details: parsed.error.flatten() }, { status: 400 });
    }

    const { eventId } = parsed.data;

    const registration = await prisma.registration.findUnique({
      where: {
        memberId_eventId: {
          memberId: session.user.id,
          eventId,
        },
      },
      include: { event: true, member: true },
    });

    if (!registration) {
      return NextResponse.json({ error: 'Kamu belum terdaftar di event ini' }, { status: 404 });
    }

    if (registration.status === 'CHECKED_IN') {
      return NextResponse.json({ error: 'Kamu sudah check-in sebelumnya' }, { status: 409 });
    }

    const now = new Date();
    const { opensAt, closesAt } = getCheckInWindow(registration.event);

    if (now < opensAt) {
      return NextResponse.json({ error: 'Check-in hanya bisa dilakukan pada hari-H event' }, { status: 400 });
    }

    if (now > closesAt) {
      return NextResponse.json({ error: 'Waktu check-in sudah ditutup, hubungi admin kalau kamu ikut event ini' }, { status: 400 });
    }

    const updatedRegistration = await prisma.registration.update({
      where: { id: registration.id },
      data: {
        status: 'CHECKED_IN',
        checkedInAt: new Date(),
      },
    });

    // Hitung ulang total kehadiran buat cek apakah ada lencana baru yang tercapai
    const attendedCount = await prisma.registration.count({
      where: { memberId: session.user.id, status: 'CHECKED_IN' },
    });
    const crossed = getCrossedBadge(attendedCount - 1, attendedCount);

    // Kirim email transactional, gak nge-block response kalau gagal
    try {
      const checkedInAtLabel = new Date(updatedRegistration.checkedInAt!).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Jakarta',
      });

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL as string,
        to: registration.member.email,
        subject: `Check-in Berhasil - ${registration.event.name}`,
        html: getCheckInEmailHtml({
          memberName: registration.member.name,
          eventName: registration.event.name,
          checkedInAtLabel,
        }),
      });
    } catch (emailError) {
      console.error('Gagal kirim email check-in:', emailError);
    }

    return NextResponse.json({
      message: 'Check-in berhasil',
      registration: updatedRegistration,
      attendedCount,
      newBadge: crossed ? { key: crossed.key, name: crossed.name } : null,
    });
  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
