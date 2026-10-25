import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const events = await prisma.event.findMany({
    where: { isPublished: true },
    orderBy: { eventDate: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
      coverImageUrl: true,
      eventDate: true,
      eventTime: true,
      meetingPoint: true,
      quota: true,
      registrationClosed: true,
      _count: {
        select: { registrations: true },
      },
    },
  });

  return NextResponse.json({ events });
}
