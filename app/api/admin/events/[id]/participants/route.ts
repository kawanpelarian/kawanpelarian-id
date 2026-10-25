import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: Params) {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') ?? undefined;
  const status = searchParams.get('status') ?? undefined;

  const registrations = await prisma.registration.findMany({
    where: {
      eventId: id,
      status: status ? (status as 'REGISTERED' | 'CHECKED_IN' | 'ABSENT') : undefined,
      member: search
        ? {
            OR: [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }],
          }
        : undefined,
    },
    include: { member: true },
    orderBy: { registeredAt: 'desc' },
  });

  const summary = {
    registered: registrations.filter((r) => r.status === 'REGISTERED').length,
    checkedIn: registrations.filter((r) => r.status === 'CHECKED_IN').length,
    absent: registrations.filter((r) => r.status === 'ABSENT').length,
    total: registrations.length,
  };

  return NextResponse.json({ registrations, summary });
}
