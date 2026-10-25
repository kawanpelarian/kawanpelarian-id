// app/api/admin/orders/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@/generated/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const batchParam = searchParams.get('batch');

  const where: Prisma.OrderWhereInput = {};
  if (status && ['PENDING', 'VERIFIED', 'REJECTED'].includes(status)) {
    where.status = status as 'PENDING' | 'VERIFIED' | 'REJECTED';
  }

  const batch = batchParam ? Number.parseInt(batchParam, 10) : NaN;
  if (Number.isInteger(batch) && batch > 0) {
    where.batch = batch;
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      member: { select: { id: true, name: true, email: true, phone: true } },
      items: {
        include: {
          variant: { include: { product: { select: { name: true } } } },
        },
      },
    },
  });

  return NextResponse.json({ orders });
}
