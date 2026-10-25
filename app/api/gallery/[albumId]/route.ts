import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface Params {
  params: Promise<{ albumId: string }>;
}

export async function GET(request: Request, { params }: Params) {
  const { albumId } = await params;

  const album = await prisma.album.findUnique({
    where: { id: albumId },
    include: {
      event: { select: { name: true, slug: true, eventDate: true, isPublished: true } },
      photos: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!album || !album.event.isPublished) {
    return NextResponse.json({ error: 'Album tidak ditemukan' }, { status: 404 });
  }

  return NextResponse.json({ album });
}
