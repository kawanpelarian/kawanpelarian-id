import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { updateEventSchema } from '@/schemas/event.schema';
import { slugify } from '@/lib/slugify';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: Params) {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      route: true,
      album: true,
      _count: {
        select: { registrations: true },
      },
    },
  });

  if (!event) {
    return NextResponse.json({ error: 'Event tidak ditemukan' }, { status: 404 });
  }

  return NextResponse.json({ event });
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = updateEventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Data tidak valid', details: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;
    const updateData: Record<string, unknown> = { ...data };

    if (data.eventDate) {
      updateData.eventDate = new Date(data.eventDate);
    }

    if (data.slug) {
      const baseSlug = slugify(data.slug);
      let finalSlug = baseSlug;
      let counter = 1;

      while (
        await prisma.event.findFirst({
          where: { slug: finalSlug, NOT: { id } },
        })
      ) {
        finalSlug = `${baseSlug}-${counter}`;
        counter++;
      }

      updateData.slug = finalSlug;
    }

    const event = await prisma.event.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ message: 'Event berhasil diperbarui', event });
  } catch (error) {
    console.error('Update event error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.event.delete({ where: { id } });
    return NextResponse.json({ message: 'Event berhasil dihapus' });
  } catch (error) {
    console.error('Delete event error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
