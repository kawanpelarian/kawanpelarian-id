import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { registerSchema } from '@/schemas/auth.schema';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { success } = rateLimit(`register:${ip}`, { limit: 5, windowMs: 15 * 60 * 1000 });

  if (!success) {
    return NextResponse.json({ error: 'Terlalu banyak percobaan registrasi, coba lagi 15 menit lagi' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Data tidak valid', details: parsed.error.flatten() }, { status: 400 });
    }

    const { name, email, phone, password } = parsed.data;

    const existingMember = await prisma.member.findUnique({
      where: { email },
    });

    if (existingMember) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const member = await prisma.member.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      {
        message: 'Registrasi berhasil',
        member: { id: member.id, name: member.name, email: member.email },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
