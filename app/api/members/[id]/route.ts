// app/api/members/[id]/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Params) {
  const session = await auth();

  if (!session || session.user.role !== 'MEMBER') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  const { id } = await params;
  const isSelf = id === session.user.id;

  const member = await prisma.member.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      bio: true,
      avatarUrl: true,
      instagram: true,
      strava: true,
      tiktok: true,
      isProfileHidden: true,
      createdAt: true,
    },
  });

  if (!member || (member.isProfileHidden && !isSelf)) {
    return NextResponse.json({ error: 'Profil tidak ditemukan' }, { status: 404 });
  }

  const where = { memberId: id, status: 'CHECKED_IN' as const };

  const [attendedCount, attended] = await Promise.all([
    prisma.registration.count({ where }),
    prisma.registration.findMany({
      where,
      select: { id: true, event: { select: { name: true, slug: true, eventDate: true } } },
      orderBy: { event: { eventDate: 'desc' } },
      take: 20,
    }),
  ]);

  return NextResponse.json({
    member: { ...member, attendedCount, isSelf },
    events: attended.map((r) => ({ id: r.id, ...r.event })),
  });
}
