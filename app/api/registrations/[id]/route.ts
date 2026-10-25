import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

interface Params {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: Request, { params }: Params) {
  const session = await auth();

  if (!session || session.user.role !== 'MEMBER') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  const { id } = await params;

  const registration = await prisma.registration.findUnique({
    where: { id },
  });

  if (!registration) {
    return NextResponse.json({ error: 'Pendaftaran tidak ditemukan' }, { status: 404 });
  }

  // Cuma boleh batalin pendaftaran sendiri, bukan punya member lain
  if (registration.memberId !== session.user.id) {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 403 });
  }

  // Kalau udah check-in, gak masuk akal dibatalin lagi
  if (registration.status === 'CHECKED_IN') {
    return NextResponse.json({ error: 'Gak bisa batalin pendaftaran yang udah check-in' }, { status: 400 });
  }

  await prisma.registration.delete({ where: { id } });

  return NextResponse.json({ message: 'Pendaftaran berhasil dibatalkan' });
}
