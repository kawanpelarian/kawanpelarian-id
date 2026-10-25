import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  const { id } = await params;

  const existingEvent = await prisma.event.findUnique({ where: { id } });

  if (!existingEvent) {
    return NextResponse.json({ error: 'Event tidak ditemukan' }, { status: 404 });
  }

  const event = await prisma.event.update({
    where: { id },
    data: { registrationClosed: !existingEvent.registrationClosed },
  });

  return NextResponse.json({
    message: event.registrationClosed ? 'Pendaftaran event ditutup' : 'Pendaftaran event dibuka lagi',
    event,
  });
}
