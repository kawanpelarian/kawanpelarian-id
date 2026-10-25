// app/api/forgot-password/route.ts
import { NextResponse } from 'next/server';
import { createHash, randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';
import { resend } from '@/lib/resend';
import { siteConfig } from '@/lib/site-config';
import { getResetPasswordEmailHtml } from '@/lib/email-templates';
import { forgotPasswordSchema } from '@/schemas/auth.schema';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

const TOKEN_TTL_MINUTES = 60;

// Respons selalu sama, ada atau tidaknya email di database, supaya
// orang tidak bisa menebak email mana yang terdaftar.
const GENERIC_RESPONSE = {
  message: 'Jika email terdaftar, link reset password sudah kami kirim. Cek inbox atau folder spam.',
};

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const ipLimit = rateLimit(`forgot:ip:${ip}`, { limit: 5, windowMs: 15 * 60 * 1000 });

  if (!ipLimit.success) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan, coba lagi 15 menit lagi' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Format email tidak valid' }, { status: 400 });
    }

    const email = parsed.data.email.trim().toLowerCase();

    // Batasi per email supaya inbox seseorang tidak dibanjiri
    const emailLimit = rateLimit(`forgot:email:${email}`, { limit: 3, windowMs: 15 * 60 * 1000 });
    if (!emailLimit.success) {
      return NextResponse.json(GENERIC_RESPONSE);
    }

    const member = await prisma.member.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
      select: { id: true, name: true, email: true },
    });

    if (!member) {
      return NextResponse.json(GENERIC_RESPONSE);
    }

    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000);

    // Hanya satu token aktif per member
    await prisma.$transaction([
      prisma.passwordResetToken.deleteMany({ where: { memberId: member.id } }),
      prisma.passwordResetToken.create({
        data: { memberId: member.id, tokenHash, expiresAt },
      }),
    ]);

    const resetUrl = `${siteConfig.url}/reset-password?token=${token}`;

    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL as string,
        to: member.email,
        subject: 'Reset Password - Kawan Pelarian',
        html: getResetPasswordEmailHtml({
          memberName: member.name,
          resetUrl,
          expiresInMinutes: TOKEN_TTL_MINUTES,
        }),
      });
    } catch (emailError) {
      console.error('Forgot password email error:', emailError);
    }

    return NextResponse.json(GENERIC_RESPONSE);
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
