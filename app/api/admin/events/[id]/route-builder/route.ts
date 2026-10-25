import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { routeSchema } from '@/schemas/route.schema';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: Params) {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  const { id } = await params;

  const route = await prisma.route.findUnique({
    where: { eventId: id },
  });

  return NextResponse.json({ route });
}

export async function PUT(request: Request, { params }: Params) {
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
    const parsed = routeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Data tidak valid', details: parsed.error.flatten() }, { status: 400 });
    }

    const { points, distanceKm, startLabel, finishLabel } = parsed.data;

    const route = await prisma.route.upsert({
      where: { eventId: id },
      update: {
        points,
        distanceKm,
        startLabel,
        finishLabel,
      },
      create: {
        eventId: id,
        points,
        distanceKm,
        startLabel,
        finishLabel,
      },
    });

    return NextResponse.json({ message: 'Rute berhasil disimpan', route });
  } catch (error) {
    console.error('Save route error:', error);
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
    await prisma.route.delete({ where: { eventId: id } });
    return NextResponse.json({ message: 'Rute berhasil dihapus' });
  } catch (error) {
    console.error('Delete route error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
