import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { eventId, memberId } = body;

    if (!eventId || !memberId) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { _count: { select: { registrations: true } } },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event tidak ditemukan' }, { status: 404 });
    }

    if (event._count.registrations >= event.quota) {
      return NextResponse.json({ error: 'Kuota event sudah penuh' }, { status: 409 });
    }

    const existingRegistration = await prisma.registration.findUnique({
      where: { memberId_eventId: { memberId, eventId } },
    });

    if (existingRegistration) {
      return NextResponse.json({ error: 'Member ini sudah terdaftar di event ini' }, { status: 409 });
    }

    const registration = await prisma.registration.create({
      data: { memberId, eventId },
      include: { member: true },
    });

    return NextResponse.json({ message: 'Peserta berhasil didaftarkan', registration }, { status: 201 });
  } catch (error) {
    console.error('Manual register error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
