import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { isCheckInOpen } from '@/lib/check-in-window';

export const dynamic = 'force-dynamic';

interface Params {
  params: Promise<{ slug: string }>;
}

export async function GET(request: Request, { params }: Params) {
  const { slug } = await params;
  const session = await auth();

  const event = await prisma.event.findUnique({
    where: { slug, isPublished: true },
    include: {
      route: true,
      album: {
        include: { photos: true },
      },
      _count: {
        select: { registrations: true },
      },
    },
  });

  if (!event) {
    return NextResponse.json({ error: 'Event tidak ditemukan' }, { status: 404 });
  }

  let isRegisteredByMe = false;
  let myRegistrationId: string | null = null;
  let myRegistrationStatus: string | null = null;
  let checkInOpen = false;

  if (session?.user.role === 'MEMBER') {
    const existingRegistration = await prisma.registration.findUnique({
      where: {
        memberId_eventId: {
          memberId: session.user.id,
          eventId: event.id,
        },
      },
    });

    if (existingRegistration) {
      isRegisteredByMe = true;
      myRegistrationId = existingRegistration.id;
      myRegistrationStatus = existingRegistration.status;
      // Dihitung di server, sama persis dengan validasi di API check-in
      checkInOpen = existingRegistration.status === 'REGISTERED' && isCheckInOpen(event);
    }
  }

  return NextResponse.json({
    event: { ...event, isRegisteredByMe, myRegistrationId, myRegistrationStatus, checkInOpen },
  });
}
