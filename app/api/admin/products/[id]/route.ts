// app/api/admin/products/[id]/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { productSchema } from '@/schemas/product.schema';
import { rateLimit } from '@/lib/rate-limit';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: Params) {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      variants: true,
      images: { orderBy: { order: 'asc' } },
    },
  });

  if (!product) {
    return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
  }

  return NextResponse.json({ product });
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  const { success } = rateLimit(`admin-product-update:${session.user.id}`, {
    limit: 30,
    windowMs: 60 * 1000,
  });

  if (!success) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan, coba lagi sebentar' }, { status: 429 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { variants, imageUrl, images, ...productData } = parsed.data;

    const existingVariants = await prisma.variant.findMany({ where: { productId: id } });
    const incomingIds = variants.filter((v) => v.id).map((v) => v.id);

    // Varian yang gak ada di payload baru = dihapus admin, hapus juga di DB
    const variantIdsToDelete = existingVariants.filter((v) => !incomingIds.includes(v.id)).map((v) => v.id);

    const product = await prisma.$transaction(async (tx) => {
      if (variantIdsToDelete.length > 0) {
        await tx.variant.deleteMany({ where: { id: { in: variantIdsToDelete } } });
      }

      for (const v of variants) {
        if (v.id) {
          await tx.variant.update({
            where: { id: v.id },
            data: { size: v.size, stock: v.stock },
          });
        } else {
          await tx.variant.create({
            data: { productId: id, size: v.size, stock: v.stock },
          });
        }
      }

      // images cuma array URL (gak ada id per item), jadi replace total aja -
      // hapus semua yang lama, bikin baru sesuai urutan payload
      await tx.productImage.deleteMany({ where: { productId: id } });
      if (images.length > 0) {
        await tx.productImage.createMany({
          data: images.map((url, index) => ({ productId: id, url, order: index })),
        });
      }

      return tx.product.update({
        where: { id },
        data: { ...productData, imageUrl: imageUrl || null },
        include: { variants: true, images: true },
      });
    });

    return NextResponse.json({ message: 'Produk berhasil diperbarui', product });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  const { success } = rateLimit(`admin-product-delete:${session.user.id}`, {
    limit: 20,
    windowMs: 60 * 1000,
  });

  if (!success) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan, coba lagi sebentar' }, { status: 429 });
  }

  const { id } = await params;

  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ message: 'Produk berhasil dihapus' });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
