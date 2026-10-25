import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

interface Params {
  params: Promise<{ albumId: string }>;
}

const coverSchema = z.object({
  photoUrl: z.string().url('URL foto tidak valid'),
});

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  const { albumId } = await params;

  try {
    const body = await request.json();
    const parsed = coverSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Data tidak valid', details: parsed.error.flatten() }, { status: 400 });
    }

    const album = await prisma.album.update({
      where: { id: albumId },
      data: { coverPhotoUrl: parsed.data.photoUrl },
    });

    return NextResponse.json({ message: 'Cover album berhasil diatur', album });
  } catch (error) {
    console.error('Set cover album error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
