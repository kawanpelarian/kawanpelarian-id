// app/api/profile/badges/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();

  if (!session || session.user.role !== 'MEMBER') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  const attendedCount = await prisma.registration.count({
    where: { memberId: session.user.id, status: 'CHECKED_IN' },
  });

  return NextResponse.json({ attendedCount });
}
