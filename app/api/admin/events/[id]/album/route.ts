import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

interface Params {
  params: Promise<{ id: string }>;
}

const albumSchema = z.object({
  name: z.string().min(3, 'Nama album minimal 3 karakter'),
  driveLink: z.string().url('Link Google Drive gak valid').optional().or(z.literal('')),
});

export async function GET(request: Request, { params }: Params) {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  const { id } = await params;

  const album = await prisma.album.findUnique({
    where: { eventId: id },
    include: { photos: { orderBy: { createdAt: 'desc' } } },
  });

  return NextResponse.json({ album });
}

export async function POST(request: Request, { params }: Params) {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  const { id } = await params;

  const event = await prisma.event.findUnique({ where: { id } });

  if (!event) {
    return NextResponse.json({ error: 'Event tidak ditemukan' }, { status: 404 });
  }

  try {
    const body = await request.json();
    const parsed = albumSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Data tidak valid', details: parsed.error.flatten() }, { status: 400 });
    }

    const album = await prisma.album.upsert({
      where: { eventId: id },
      update: {
        name: parsed.data.name,
        driveLink: parsed.data.driveLink || null,
      },
      create: {
        eventId: id,
        name: parsed.data.name,
        driveLink: parsed.data.driveLink || null,
      },
    });

    return NextResponse.json({ message: 'Album berhasil disimpan', album });
  } catch (error) {
    console.error('Create album error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
