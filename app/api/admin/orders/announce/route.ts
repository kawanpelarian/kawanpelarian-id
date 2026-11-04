// app/api/admin/orders/announce/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { resend } from '@/lib/resend';
import { getOrderAnnouncementEmailHtml } from '@/lib/email-templates';
import type { Prisma } from '@/generated/prisma';

export const dynamic = 'force-dynamic';

const CHUNK_SIZE = 100;

const announceSchema = z.object({
  batch: z.number().int().positive().optional(),
  eventName: z.string().trim().min(1, 'Nama event wajib diisi').max(100),
  eventInfo: z.string().trim().max(200).optional(),
  message: z.string().trim().min(1, 'Pesan wajib diisi').max(1000),
});

async function getRecipients(batch?: number) {
  const where: Prisma.OrderWhereInput = { status: { not: 'REJECTED' } };
  if (batch) where.batch = batch;

  const orders = await prisma.order.findMany({
    where,
    select: { member: { select: { id: true, name: true, email: true } } },
  });

  const unique = new Map<string, { name: string; email: string }>();
  for (const { member } of orders) {
    if (member.email) unique.set(member.id, { name: member.name, email: member.email });
  }

  return Array.from(unique.values());
}

export async function GET(request: Request) {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  const batchParam = Number.parseInt(new URL(request.url).searchParams.get('batch') ?? '', 10);
  const recipients = await getRecipients(Number.isInteger(batchParam) && batchParam > 0 ? batchParam : undefined);

  return NextResponse.json({ recipients: recipients.length });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  const parsed = announceSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Data tidak valid' }, { status: 400 });
  }

  const { batch, eventName, eventInfo, message } = parsed.data;
  const recipients = await getRecipients(batch);

  if (recipients.length === 0) {
    return NextResponse.json({ error: 'Tidak ada penerima untuk batch ini' }, { status: 400 });
  }

  const emails = recipients.map((recipient) => ({
    from: process.env.RESEND_FROM_EMAIL as string,
    to: recipient.email,
    subject: `Pengumuman ${eventName} - Kawan Pelarian`,
    html: getOrderAnnouncementEmailHtml({ memberName: recipient.name, eventName, eventInfo, message }),
  }));

  let sent = 0;
  let failed = 0;

  for (let i = 0; i < emails.length; i += CHUNK_SIZE) {
    const chunk = emails.slice(i, i + CHUNK_SIZE);

    try {
      const { error } = await resend.batch.send(chunk);
      if (error) {
        console.error('Gagal kirim pengumuman:', error);
        failed += chunk.length;
      } else {
        sent += chunk.length;
      }
    } catch (error) {
      console.error('Gagal kirim pengumuman:', error);
      failed += chunk.length;
    }
  }

  return NextResponse.json({ sent, failed });
}
