// lib/perform-check-in.ts
import { prisma } from '@/lib/prisma';
import { resend } from '@/lib/resend';
import { getCrossedBadge } from '@/lib/badges';
import { getCheckInEmailHtml } from '@/lib/email-templates';

export async function performCheckIn(registrationId: string) {
  const checkedInAt = new Date();

  // updateMany + syarat status supaya dua pemindai yang scan QR sama bersamaan tidak sama-sama lolos
  const updated = await prisma.registration.updateMany({
    where: { id: registrationId, status: { not: 'CHECKED_IN' } },
    data: { status: 'CHECKED_IN', checkedInAt },
  });

  if (updated.count === 0) return null;

  const registration = await prisma.registration.findUniqueOrThrow({
    where: { id: registrationId },
    include: { member: true, event: true },
  });

  const attendedCount = await prisma.registration.count({
    where: { memberId: registration.memberId, status: 'CHECKED_IN' },
  });
  const crossed = getCrossedBadge(attendedCount - 1, attendedCount);

  try {
    const checkedInAtLabel = checkedInAt.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta',
    });

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL as string,
      to: registration.member.email,
      subject: `Check-in Berhasil - ${registration.event.name}`,
      html: getCheckInEmailHtml({
        memberName: registration.member.name,
        eventName: registration.event.name,
        checkedInAtLabel,
      }),
    });
  } catch (emailError) {
    console.error('Gagal kirim email check-in:', emailError);
  }

  return {
    registration,
    attendedCount,
    newBadge: crossed ? { key: crossed.key, name: crossed.name } : null,
  };
}
