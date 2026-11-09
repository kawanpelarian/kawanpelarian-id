// app/api/events/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Wajib, biar Next.js gak nge-cache response ini secara statis. Tanpa ini,
// data event baru bisa gak muncul sampai ada revalidate/redeploy, karena
// route ini gak pakai fungsi dinamis apapun yang biasanya bikin Next.js
// otomatis treat sebagai dynamic route.
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
      price: true,
      registrationClosed: true,
      _count: {
        select: { registrations: { where: { paymentStatus: { not: 'REJECTED' } } } },
      },
    },
  });

  return NextResponse.json({ events });
}
