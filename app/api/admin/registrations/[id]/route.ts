// app/api/admin/registrations/[id]/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

interface Params {
  params: Promise<{ id: string }>;
}

const updateStatusSchema = z.object({
  status: z.enum(['REGISTERED', 'CHECKED_IN', 'ABSENT']),
});

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = updateStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Data tidak valid', details: parsed.error.flatten() }, { status: 400 });
    }

    const { status } = parsed.data;

    if (status === 'CHECKED_IN') {
      const current = await prisma.registration.findUnique({
        where: { id },
        select: { paymentStatus: true },
      });

      if (!current) {
        return NextResponse.json({ error: 'Pendaftaran tidak ditemukan' }, { status: 404 });
      }

      if (current.paymentStatus !== 'VERIFIED') {
        return NextResponse.json({ error: 'Pembayaran peserta ini belum diverifikasi' }, { status: 400 });
      }
    }

    const registration = await prisma.registration.update({
      where: { id },
      data: {
        status,
        checkedInAt: status === 'CHECKED_IN' ? new Date() : null,
      },
    });

    return NextResponse.json({
      message: 'Status kehadiran berhasil diperbarui',
      registration,
    });
  } catch (error) {
    console.error('Update attendance error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
