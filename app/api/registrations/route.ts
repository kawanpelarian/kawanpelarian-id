// app/api/registrations/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';
import { resend } from '@/lib/resend';
import { getEventDateTime } from '@/lib/get-event-datetime';
import { getTicketEmailHtml } from '@/lib/email-templates';
import { generateEventIcs } from '@/lib/generate-ics';
import { getEventPaymentReceivedEmailHtml } from '@/lib/email-templates';
import { uploadPaymentProof, validateProofFile } from '@/lib/upload-payment-proof';

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
    // Event gratis dikirim sebagai JSON, event berbayar sebagai multipart (ada bukti transfer)
    let eventId: string | undefined;
    let proofFile: File | null = null;

    if ((request.headers.get('content-type') ?? '').includes('multipart/form-data')) {
      const formData = await request.formData();
      eventId = (formData.get('eventId') as string | null) ?? undefined;
      proofFile = formData.get('proof') as File | null;
    } else {
      const body = await request.json();
      eventId = body.eventId;
    }

    if (!eventId) {
      return NextResponse.json({ error: 'Event tidak valid' }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
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

    // Pendaftar yang pembayarannya ditolak tidak memakai kuota
    const takenSlots = await prisma.registration.count({
      where: { eventId, paymentStatus: { not: 'REJECTED' } },
    });

    if (takenSlots >= event.quota) {
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

    const isPaidEvent = event.price > 0;

    if (isPaidEvent) {
      const proofError = validateProofFile(proofFile);

      if (proofError) {
        return NextResponse.json({ error: proofError }, { status: 400 });
      }

      const proofUrl = await uploadPaymentProof(proofFile as File);

      const registration = await prisma.registration.create({
        data: {
          memberId: session.user.id,
          eventId,
          paymentStatus: 'PENDING',
          amountPaid: event.price,
          proofUrl,
        },
      });

      // Konfirmasi bukti masuk ke member + notif ke admin, gak nge-block response kalau gagal
      try {
        const amountLabel = `Rp${event.price.toLocaleString('id-ID')}`;

        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL as string,
          to: session.user.email as string,
          subject: `Bukti Transfer Diterima - ${event.name}`,
          html: getEventPaymentReceivedEmailHtml({
            memberName: session.user.name as string,
            eventName: event.name,
            amountLabel,
          }),
        });

        const admins = await prisma.admin.findMany({ select: { email: true } });

        if (admins.length > 0) {
          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL as string,
            to: admins.map((a) => a.email),
            subject: `Pembayaran Event Baru - ${session.user.name}`,
            html: `
              <div style="max-width: 480px; margin: 0 auto; font-family: -apple-system, sans-serif;">
                <div style="background: #162349; color: #ffffff; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
                  <p style="margin: 0; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; opacity: 0.7;">Pembayaran Event</p>
                  <h1 style="margin: 8px 0 0; font-size: 20px;">Perlu Diverifikasi</h1>
                </div>
                <div style="border: 2px dashed #162349; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
                  <p style="margin: 0 0 8px; font-size: 14px;"><strong>Peserta:</strong> ${session.user.name}</p>
                  <p style="margin: 0 0 8px; font-size: 14px;"><strong>Event:</strong> ${event.name}</p>
                  <p style="margin: 0; font-size: 14px;"><strong>Total:</strong> ${amountLabel}</p>
                  <p style="margin: 20px 0 0; font-size: 13px; color: #737373; text-align: center;">
                    Buka halaman Peserta di dashboard admin buat cek bukti transfer.
                  </p>
                </div>
              </div>
            `,
          });
        }
      } catch (emailError) {
        console.error('Gagal kirim email pembayaran event:', emailError);
      }

      return NextResponse.json({ message: 'Bukti transfer terkirim, tunggu verifikasi dari admin ya', registration }, { status: 201 });
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
