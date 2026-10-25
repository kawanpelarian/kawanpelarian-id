// app/api/profile/public/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { publicProfileSchema } from '@/schemas/public-profile.schema';

export const dynamic = 'force-dynamic';

const select = {
  bio: true,
  avatarUrl: true,
  instagram: true,
  strava: true,
  tiktok: true,
  isProfileHidden: true,
} as const;

export async function GET() {
  const session = await auth();

  if (!session || session.user.role !== 'MEMBER') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  const member = await prisma.member.findUnique({ where: { id: session.user.id }, select });

  if (!member) {
    return NextResponse.json({ error: 'Member tidak ditemukan' }, { status: 404 });
  }

  return NextResponse.json({ profile: member });
}

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session || session.user.role !== 'MEMBER') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  try {
    const parsed = publicProfileSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Data tidak valid' }, { status: 400 });
    }

    const { bio, instagram, strava, tiktok, isProfileHidden } = parsed.data;

    const member = await prisma.member.update({
      where: { id: session.user.id },
      data: {
        bio: bio || null,
        instagram: instagram || null,
        strava: strava || null,
        tiktok: tiktok || null,
        isProfileHidden,
      },
      select,
    });

    return NextResponse.json({ profile: member });
  } catch (error) {
    console.error('Update public profile error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
