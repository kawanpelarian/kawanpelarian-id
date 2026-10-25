// app/api/reset-password/route.ts
import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { resetPasswordSchema } from '@/schemas/auth.schema';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { success } = rateLimit(`reset:ip:${ip}`, { limit: 10, windowMs: 15 * 60 * 1000 });

  if (!success) {
    return NextResponse.json({ error: 'Terlalu banyak percobaan, coba lagi 15 menit lagi' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Data tidak valid' }, { status: 400 });
    }

    const { token, password } = parsed.data;
    const tokenHash = createHash('sha256').update(token).digest('hex');

    const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

    if (!record || record.expiresAt < new Date()) {
      if (record) {
        await prisma.passwordResetToken.delete({ where: { id: record.id } }).catch(() => {});
      }
      return NextResponse.json({ error: 'Link reset tidak valid atau sudah kedaluwarsa. Silakan minta link baru.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Ganti password + hapus semua token member ini (sekali pakai)
    await prisma.$transaction([
      prisma.member.update({
        where: { id: record.memberId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.deleteMany({ where: { memberId: record.memberId } }),
    ]);

    return NextResponse.json({ message: 'Password berhasil diubah, silakan login' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
