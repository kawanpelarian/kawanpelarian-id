import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { changePasswordSchema } from '@/schemas/profile.schema';

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session || session.user.role !== 'MEMBER') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Data tidak valid', details: parsed.error.flatten() }, { status: 400 });
    }

    const { currentPassword, newPassword } = parsed.data;

    const member = await prisma.member.findUnique({
      where: { id: session.user.id },
    });

    if (!member) {
      return NextResponse.json({ error: 'Member tidak ditemukan' }, { status: 404 });
    }

    // Akun yang daftar/login via Google gak punya password sama sekali.
    // Kasus ini dianggap "set password baru" (bukan "ganti"), jadi skip
    // pengecekan currentPassword.
    if (member.password) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Password saat ini wajib diisi' }, { status: 400 });
      }

      const isValid = await bcrypt.compare(currentPassword, member.password);

      if (!isValid) {
        return NextResponse.json({ error: 'Password saat ini salah' }, { status: 400 });
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.member.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: 'Password berhasil diganti' });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
