// app/api/admin/registrations/[id]/payment/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { resend } from '@/lib/resend';
import { siteConfig } from '@/lib/site-config';
import { generateEventIcs } from '@/lib/generate-ics';
import { getTicketEmailHtml, getEventPaymentRejectedEmailHtml } from '@/lib/email-templates';

interface Params {
  params: Promise<{ id: string }>;
}

const paymentSchema = z.object({
  status: z.enum(['PENDING', 'VERIFIED', 'REJECTED']),
  rejectReason: z.string().max(300).optional(),
});

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  const { id } = await params;
  const parsed = paymentSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 });
  }

  const { status, rejectReason } = parsed.data;

  const registration = await prisma.registration.findUnique({
    where: { id },
    include: { event: true, member: true },
  });

  if (!registration) {
    return NextResponse.json({ error: 'Pendaftaran tidak ditemukan' }, { status: 404 });
  }

  if (registration.paymentStatus === status) {
    return NextResponse.json({ error: 'Status pembayaran sudah sama' }, { status: 400 });
  }

  // Membatalkan penolakan berarti peserta kembali memakai kuota
  if (registration.paymentStatus === 'REJECTED') {
    const taken = await prisma.registration.count({
      where: { eventId: registration.eventId, paymentStatus: { not: 'REJECTED' } },
    });

    if (taken >= registration.event.quota) {
      return NextResponse.json({ error: 'Kuota event sudah penuh' }, { status: 409 });
    }
  }

  const updated = await prisma.registration.update({
    where: { id },
    data: {
      paymentStatus: status,
      paymentRejectReason: status === 'REJECTED' ? rejectReason?.trim() || null : null,
    },
  });

  const { event, member } = registration;

  try {
    if (status === 'VERIFIED') {
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
        to: member.email,
        subject: `Pembayaran Terverifikasi - Tiket ${event.name}`,
        html: getTicketEmailHtml({
          memberName: member.name,
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
    }

    if (status === 'REJECTED') {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL as string,
        to: member.email,
        subject: `Pembayaran Ditolak - ${event.name}`,
        html: getEventPaymentRejectedEmailHtml({
          memberName: member.name,
          eventName: event.name,
          reason: updated.paymentRejectReason ?? undefined,
          eventUrl: `${siteConfig.url}/events/${event.slug}`,
        }),
      });
    }
  } catch (emailError) {
    console.error('Gagal kirim email status pembayaran:', emailError);
  }

  return NextResponse.json({ message: 'Status pembayaran diperbarui', registration: updated });
}
