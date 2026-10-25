import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import bcrypt from 'bcrypt';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { quickCreateMemberSchema } from '@/schemas/admin-member.schema';

export async function GET(request: Request) {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') ?? undefined;

  const members = await prisma.member.findMany({
    where: search
      ? {
          OR: [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }, { phone: { contains: search } }],
        }
      : undefined,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      _count: { select: { registrations: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ members });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = quickCreateMemberSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Data tidak valid', details: parsed.error.flatten() }, { status: 400 });
    }

    const { name, email, phone } = parsed.data;

    const existingMember = await prisma.member.findUnique({ where: { email } });

    if (existingMember) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 409 });
    }

    // Member dibuat manual sama admin belum tentu bakal login sendiri,
    // jadi password di-random aja, bukan diinput manual sama admin
    const randomPassword = randomBytes(16).toString('hex');
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    const member = await prisma.member.create({
      data: { name, email, phone, password: hashedPassword },
    });

    return NextResponse.json(
      {
        message: 'Member berhasil dibuat',
        member: { id: member.id, name: member.name, email: member.email, phone: member.phone },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Quick create member error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
