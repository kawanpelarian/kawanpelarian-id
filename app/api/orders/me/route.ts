// app/api/orders/me/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();

  if (!session || session.user.role !== 'MEMBER') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { memberId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: {
          variant: { include: { product: { select: { name: true, imageUrl: true } } } },
        },
      },
    },
  });

  return NextResponse.json({ orders });
}
