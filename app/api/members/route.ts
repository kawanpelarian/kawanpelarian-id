// app/api/members/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 20;

export async function GET(request: Request) {
  const session = await auth();

  if (!session || session.user.role !== 'MEMBER') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = (searchParams.get('search') ?? '').trim().slice(0, 50);
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const where = {
    isProfileHidden: false,
    ...(search && { name: { contains: search, mode: 'insensitive' as const } }),
  };

  const [total, members] = await Promise.all([
    prisma.member.count({ where }),
    prisma.member.findMany({
      where,
      select: { id: true, name: true, avatarUrl: true },
      orderBy: { name: 'asc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  const attendance = await prisma.registration.groupBy({
    by: ['memberId'],
    where: { status: 'CHECKED_IN', memberId: { in: members.map((m) => m.id) } },
    _count: { _all: true },
  });
  const attendedById = new Map(attendance.map((a) => [a.memberId, a._count._all]));

  return NextResponse.json({
    members: members.map((m) => ({ ...m, attendedCount: attendedById.get(m.id) ?? 0 })),
    total,
    page,
    pageSize: PAGE_SIZE,
  });
}
