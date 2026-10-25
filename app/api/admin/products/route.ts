// app/api/admin/products/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { productSchema } from '@/schemas/product.schema';
import { rateLimit } from '@/lib/rate-limit';
import { slugify } from '@/lib/slugify';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      variants: true,
      images: { orderBy: { order: 'asc' } },
      _count: { select: { variants: true } },
    },
  });

  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  const { success } = rateLimit(`admin-product-create:${session.user.id}`, {
    limit: 20,
    windowMs: 60 * 1000,
  });

  if (!success) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan, coba lagi sebentar' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { variants, imageUrl, images, ...productData } = parsed.data;

    // Slug dari nama produk, kalau bentrok tambahin suffix angka (sama pola event)
    const baseSlug = slugify(productData.name) || 'produk';
    let finalSlug = baseSlug;
    let counter = 1;
    while (await prisma.product.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const product = await prisma.product.create({
      data: {
        ...productData,
        slug: finalSlug,
        imageUrl: imageUrl || null,
        variants: {
          create: variants.map((v) => ({ size: v.size, stock: v.stock })),
        },
        images: {
          create: images.map((url, index) => ({ url, order: index })),
        },
      },
      include: { variants: true, images: true },
    });

    return NextResponse.json({ message: 'Produk berhasil dibuat', product }, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
