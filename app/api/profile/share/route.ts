// app/api/profile/share/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { generateShareCode, shareUrl } from '@/lib/share-profile';

export const dynamic = 'force-dynamic';

const bodySchema = z.object({ action: z.enum(['enable', 'disable', 'regenerate']) });

async function getState(memberId: string) {
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: { shareCode: true, isSharingEnabled: true },
  });
  if (!member) return null;

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [views, viewsLast7Days] = await Promise.all([prisma.profileView.count({ where: { memberId } }), prisma.profileView.count({ where: { memberId, createdAt: { gte: since } } })]);

  return {
    isSharingEnabled: member.isSharingEnabled,
    shareCode: member.shareCode,
    shareUrl: member.shareCode ? shareUrl(member.shareCode) : null,
    views,
    viewsLast7Days,
  };
}

export async function GET() {
  const session = await auth();

  if (!session || session.user.role !== 'MEMBER') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  const state = await getState(session.user.id);
  if (!state) return NextResponse.json({ error: 'Member tidak ditemukan' }, { status: 404 });

  return NextResponse.json(state);
}

async function saveWithNewCode(memberId: string, enabled: boolean) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      await prisma.member.update({
        where: { id: memberId },
        data: { shareCode: generateShareCode(), isSharingEnabled: enabled },
      });
      return;
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code !== 'P2002') throw error;
    }
  }
  throw new Error('Gagal membuat kode unik');
}

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session || session.user.role !== 'MEMBER') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  try {
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 });
    }

    const memberId = session.user.id;
    const current = await prisma.member.findUnique({
      where: { id: memberId },
      select: { shareCode: true, isSharingEnabled: true },
    });

    if (!current) {
      return NextResponse.json({ error: 'Member tidak ditemukan' }, { status: 404 });
    }

    const { action } = parsed.data;

    if (action === 'disable') {
      await prisma.member.update({ where: { id: memberId }, data: { isSharingEnabled: false } });
    } else if (action === 'regenerate') {
      await saveWithNewCode(memberId, current.isSharingEnabled);
    } else if (current.shareCode) {
      await prisma.member.update({ where: { id: memberId }, data: { isSharingEnabled: true } });
    } else {
      await saveWithNewCode(memberId, true);
    }

    return NextResponse.json(await getState(memberId));
  } catch (error) {
    console.error('Update share error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
