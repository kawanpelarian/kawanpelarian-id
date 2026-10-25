import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';
import { resend } from '@/lib/resend';
import { getEventDateTime } from '@/lib/get-event-datetime';
import { getTicketEmailHtml } from '@/lib/email-templates';
import { generateEventIcs } from '@/lib/generate-ics';

export async function POST(request: Request) {
  const session = await auth();

  if (!session || session.user.role !== 'MEMBER') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  // Rate limit per member (bukan per IP, karena udah pasti login), buat
  // cegah spam klik daftar berkali-kali dalam waktu singkat
  const { success } = rateLimit(`register-event:${session.user.id}`, {
    limit: 10,
    windowMs: 60 * 1000,
  });

  if (!success) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan, coba lagi sebentar' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { eventId } = body;

    if (!eventId) {
      return NextResponse.json({ error: 'Event tidak valid' }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    });

    if (!event || !event.isPublished) {
      return NextResponse.json({ error: 'Event tidak ditemukan' }, { status: 404 });
    }

    if (event.registrationClosed) {
      return NextResponse.json({ error: 'Pendaftaran untuk event ini udah ditutup' }, { status: 400 });
    }

    // Event historis (dimasukkan buat selarasin riwayat) gak boleh didaftarin lagi
    if (getEventDateTime(event.eventDate, event.eventTime) < new Date()) {
      return NextResponse.json({ error: 'Event ini sudah berlalu, pendaftaran ditutup' }, { status: 400 });
    }

    if (event._count.registrations >= event.quota) {
      return NextResponse.json({ error: 'Kuota event sudah penuh' }, { status: 409 });
    }

    const existingRegistration = await prisma.registration.findUnique({
      where: {
        memberId_eventId: {
          memberId: session.user.id,
          eventId,
        },
      },
    });

    if (existingRegistration) {
      return NextResponse.json({ error: 'Kamu sudah terdaftar di event ini' }, { status: 409 });
    }

    const registration = await prisma.registration.create({
      data: {
        memberId: session.user.id,
        eventId,
      },
    });

    // Kirim email tiket reminder, gak nge-block response kalau gagal
    try {
      const eventDateLabel = new Date(event.eventDate).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      const icsContent = generateEventIcs({
        id: event.id,
        name: event.name,
        description: event.description,
        eventDate: event.eventDate,
        eventTime: event.eventTime,
        meetingPoint: event.meetingPoint,
      });

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL as string,
        to: session.user.email as string,
        subject: `Tiket Kamu - ${event.name}`,
        html: getTicketEmailHtml({
          memberName: session.user.name as string,
          eventName: event.name,
          eventDateLabel,
          eventTime: event.eventTime,
          meetingPoint: event.meetingPoint,
        }),
        attachments: [
          {
            filename: `${event.slug}.ics`,
            content: Buffer.from(icsContent).toString('base64'),
          },
        ],
      });
    } catch (emailError) {
      console.error('Gagal kirim email tiket reminder:', emailError);
    }

    return NextResponse.json({ message: 'Berhasil mendaftar event', registration }, { status: 201 });
  } catch (error) {
    console.error('Register event error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
