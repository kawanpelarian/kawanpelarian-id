// app/api/registrations/me/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { getEventDateTime } from '@/lib/get-event-datetime';
import { isCheckInOpen } from '@/lib/check-in-window';

// Wajib, biar Next.js gak nge-cache response ini. Meskipun route ini manggil
// auth() (yang baca cookie session), Next.js gak selalu otomatis ngedetect
// pemanggilan cookie yang "nyembul" dari dalam library kayak NextAuth sebagai
// alasan buat treat route ini dynamic - jadi harus dipaksa eksplisit.
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();

  if (!session || session.user.role !== 'MEMBER') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  const registrations = await prisma.registration.findMany({
    where: { memberId: session.user.id },
    include: { event: true },
    orderBy: { event: { eventDate: 'desc' } },
  });

  const now = new Date();

  // Gabungin eventDate + eventTime biar perbandingan jam-nya akurat, bukan
  // cuma bandingin tanggal doang (yang bikin event hari ini keanggep lewat
  // begitu lewat tengah malam, padahal jam eventnya belum lewat)
  const withFlags = registrations.map((r) => ({
    ...r,
    started: getEventDateTime(r.event.eventDate, r.event.eventTime) < now,
    checkInOpen: r.status === 'REGISTERED' && isCheckInOpen(r.event, now),
  }));

  // Event yang sudah mulai tapi check-in-nya masih dibuka tetap tampil di
  // "Mendatang", supaya member yang baru sampai / selesai lari masih bisa absen
  const upcoming = withFlags.filter((r) => !r.started || r.checkInOpen);
  const past = withFlags.filter((r) => r.started && !r.checkInOpen);

  return NextResponse.json({ upcoming, past });
}
