import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { updateProfileSchema } from '@/schemas/profile.schema';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();

  if (!session || session.user.role !== 'MEMBER') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  const member = await prisma.member.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      birthDate: true,
      createdAt: true,
      password: true,
    },
  });

  if (!member) {
    return NextResponse.json({ error: 'Member tidak ditemukan' }, { status: 404 });
  }

  const { password, ...memberWithoutPassword } = member;

  return NextResponse.json({
    member: { ...memberWithoutPassword, hasPassword: !!password },
  });
}

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session || session.user.role !== 'MEMBER') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Data tidak valid', details: parsed.error.flatten() }, { status: 400 });
    }

    const { birthDate, ...rest } = parsed.data;

    const member = await prisma.member.update({
      where: { id: session.user.id },
      data: {
        ...rest,
        birthDate: birthDate ? new Date(birthDate) : birthDate === '' ? null : undefined,
      },
      select: { id: true, name: true, email: true, phone: true, birthDate: true },
    });

    return NextResponse.json({ message: 'Profile berhasil diperbarui', member });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
