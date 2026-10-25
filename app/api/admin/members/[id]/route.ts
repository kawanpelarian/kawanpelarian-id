import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

interface Params {
  params: Promise<{ id: string }>;
}

const updateMemberSchema = z.object({
  name: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
  email: z.string().email('Format email tidak valid'),
  phone: z
    .string()
    .min(10, 'Nomor HP minimal 10 digit')
    .regex(/^[0-9+]+$/, 'Nomor HP hanya boleh berisi angka'),
});

export async function DELETE(request: Request, { params }: Params) {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.member.delete({ where: { id } });
    return NextResponse.json({ message: 'Member berhasil dihapus' });
  } catch (error) {
    console.error('Delete member error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = updateMemberSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Data tidak valid', details: parsed.error.flatten() }, { status: 400 });
    }

    const { name, email, phone } = parsed.data;

    const emailTaken = await prisma.member.findFirst({
      where: { email, NOT: { id } },
    });

    if (emailTaken) {
      return NextResponse.json({ error: 'Email sudah dipakai member lain' }, { status: 409 });
    }

    const member = await prisma.member.update({
      where: { id },
      data: { name, email, phone },
    });

    return NextResponse.json({
      message: 'Data member berhasil diperbarui',
      member: { id: member.id, name: member.name, email: member.email, phone: member.phone },
    });
  } catch (error) {
    console.error('Update member error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
