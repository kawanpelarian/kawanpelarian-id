// app/api/products/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      price: true,
      imageUrl: true,
      images: {
        select: { id: true, url: true },
        orderBy: { order: 'asc' },
      },
      variants: {
        select: { id: true, size: true, stock: true },
      },
    },
  });

  return NextResponse.json({ products });
}
