// app/api/events/[slug]/participants/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface Params {
  params: Promise<{ slug: string }>;
}

export async function GET(request: Request, { params }: Params) {
  const { slug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug, isPublished: true },
  });

  if (!event) {
    return NextResponse.json({ error: 'Event tidak ditemukan' }, { status: 404 });
  }

  const session = await auth();
  const isMember = session?.user.role === 'MEMBER';

  const registrations = await prisma.registration.findMany({
    where: { eventId: event.id },
    select: {
      id: true,
      status: true,
      registeredAt: true,
      memberId: true,
      member: { select: { name: true, isProfileHidden: true } },
    },
    orderBy: { registeredAt: 'asc' },
  });

  // Total kehadiran tiap peserta (dari semua event) buat ikon lencana.
  // memberId hanya dikirim ke member yang login, dan hanya untuk profil yang tidak disembunyikan.
  const attendance = await prisma.registration.groupBy({
    by: ['memberId'],
    where: {
      status: 'CHECKED_IN',
      memberId: { in: registrations.map((r) => r.memberId) },
    },
    _count: { _all: true },
  });
  const attendedByMember = new Map(attendance.map((a) => [a.memberId, a._count._all]));

  return NextResponse.json({
    registrations: registrations.map(({ memberId, member, ...rest }) => ({
      ...rest,
      member: { name: member.name },
      profileId: isMember && !member.isProfileHidden ? memberId : null,
      attendedCount: attendedByMember.get(memberId) ?? 0,
    })),
  });
}
