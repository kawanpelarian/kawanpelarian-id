import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { eventSchema } from '@/schemas/event.schema';
import { slugify } from '@/lib/slugify';

export async function GET() {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  const events = await prisma.event.findMany({
    orderBy: { eventDate: 'desc' },
    include: {
      _count: {
        select: { registrations: true },
      },
    },
  });

  return NextResponse.json({ events });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = eventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Data tidak valid', details: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;

    // Slug dari input admin (auto-generated di client, bisa diedit manual)
    const baseSlug = slugify(data.slug);
    let finalSlug = baseSlug;
    let counter = 1;

    // Pastikan slug unik, kalau bentrok tambahin suffix angka
    while (await prisma.event.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const event = await prisma.event.create({
      data: {
        name: data.name,
        slug: finalSlug,
        description: data.description,
        coverImageUrl: data.coverImageUrl,
        eventDate: new Date(data.eventDate),
        eventTime: data.eventTime,
        meetingPoint: data.meetingPoint,
        quota: data.quota,
      },
    });

    return NextResponse.json({ message: 'Event berhasil dibuat', event }, { status: 201 });
  } catch (error) {
    console.error('Create event error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
