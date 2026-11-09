// app/api/registrations/[id]/proof/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { resend } from '@/lib/resend';
import { rateLimit } from '@/lib/rate-limit';
import { getEventPaymentReceivedEmailHtml } from '@/lib/email-templates';
import { uploadPaymentProof, validateProofFile } from '@/lib/upload-payment-proof';

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: Params) {
  const session = await auth();

  if (!session || session.user.role !== 'MEMBER') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  const { success } = rateLimit(`resubmit-proof:${session.user.id}`, {
    limit: 5,
    windowMs: 60 * 1000,
  });

  if (!success) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan, coba lagi sebentar' }, { status: 429 });
  }

  const { id } = await params;

  const registration = await prisma.registration.findUnique({
    where: { id },
    include: { event: true },
  });

  if (!registration || registration.memberId !== session.user.id) {
    return NextResponse.json({ error: 'Pendaftaran tidak ditemukan' }, { status: 404 });
  }

  if (registration.paymentStatus !== 'REJECTED') {
    return NextResponse.json({ error: 'Bukti transfer hanya bisa dikirim ulang kalau pembayaran ditolak' }, { status: 400 });
  }

  const taken = await prisma.registration.count({
    where: { eventId: registration.eventId, paymentStatus: { not: 'REJECTED' } },
  });

  if (taken >= registration.event.quota) {
    return NextResponse.json({ error: 'Kuota event sudah penuh' }, { status: 409 });
  }

  const formData = await request.formData();
  const proof = formData.get('proof') as File | null;
  const proofError = validateProofFile(proof);

  if (proofError) {
    return NextResponse.json({ error: proofError }, { status: 400 });
  }

  const proofUrl = await uploadPaymentProof(proof as File);

  const updated = await prisma.registration.update({
    where: { id },
    data: {
      paymentStatus: 'PENDING',
      paymentRejectReason: null,
      proofUrl,
      amountPaid: registration.event.price,
    },
  });

  try {
    const amountLabel = `Rp${registration.event.price.toLocaleString('id-ID')}`;

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL as string,
      to: session.user.email as string,
      subject: `Bukti Transfer Diterima - ${registration.event.name}`,
      html: getEventPaymentReceivedEmailHtml({
        memberName: session.user.name as string,
        eventName: registration.event.name,
        amountLabel,
      }),
    });

    const admins = await prisma.admin.findMany({ select: { email: true } });

    if (admins.length > 0) {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL as string,
        to: admins.map((a) => a.email),
        subject: `Bukti Transfer Baru (Upload Ulang) - ${session.user.name}`,
        html: `<p>${session.user.name} mengirim ulang bukti transfer untuk <strong>${registration.event.name}</strong> (${amountLabel}). Cek di halaman Peserta dashboard admin.</p>`,
      });
    }
  } catch (emailError) {
    console.error('Gagal kirim email upload ulang bukti:', emailError);
  }

  return NextResponse.json({ message: 'Bukti transfer terkirim ulang', registration: updated });
}
