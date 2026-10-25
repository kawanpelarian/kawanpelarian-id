import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const routes = await prisma.route.findMany({
    where: {
      event: { isPublished: true },
    },
    include: {
      event: {
        select: {
          id: true,
          name: true,
          slug: true,
          eventDate: true,
        },
      },
    },
    orderBy: {
      event: { eventDate: 'desc' },
    },
  });

  return NextResponse.json({ routes });
}
