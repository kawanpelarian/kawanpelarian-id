import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const albums = await prisma.album.findMany({
    where: {
      event: { isPublished: true },
    },
    include: {
      event: {
        select: { name: true, slug: true, eventDate: true },
      },
      _count: {
        select: { photos: true },
      },
    },
    orderBy: {
      event: { eventDate: 'desc' },
    },
  });

  return NextResponse.json({ albums });
}
