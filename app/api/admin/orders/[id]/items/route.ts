// app/api/admin/orders/[id]/items/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

interface Params {
  params: Promise<{ id: string }>;
}

const editItemsSchema = z.object({
  items: z
    .array(
      z.object({
        variantId: z.string().min(1),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1, 'Pesanan minimal harus punya 1 item'),
});

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  const { success } = rateLimit(`admin-order-edit-items:${session.user.id}`, {
    limit: 30,
    windowMs: 60 * 1000,
  });

  if (!success) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan, coba lagi sebentar' }, { status: 429 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = editItemsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { items: newItems } = parsed.data;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
    }

    if (order.status === 'REJECTED') {
      return NextResponse.json({ error: 'Gak bisa edit pesanan yang udah ditolak' }, { status: 400 });
    }

    // Ambil semua variant yang dipesan (item baru) sekaligus buat validasi + harga
    const variantIds = newItems.map((i) => i.variantId);
    const variants = await prisma.variant.findMany({
      where: { id: { in: variantIds } },
      include: { product: true },
    });

    if (variants.length !== variantIds.length) {
      return NextResponse.json({ error: 'Ada produk/varian yang gak ditemukan' }, { status: 400 });
    }

    const totalAmount = newItems.reduce((sum, item) => {
      const variant = variants.find((v) => v.id === item.variantId)!;
      return sum + variant.product.price * item.quantity;
    }, 0);

    const updatedOrder = await prisma.$transaction(async (tx) => {
      // 1. Balikin dulu semua stok dari item LAMA (yang direserve pas checkout awal)
      for (const oldItem of order.items) {
        await tx.variant.update({
          where: { id: oldItem.variantId },
          data: { stock: { increment: oldItem.quantity } },
        });
      }

      // 2. Potong stok buat item BARU, sambil dicek cukup gak (kondisi gte
      // sama kayak checkout, biar aman dari race condition)
      for (const item of newItems) {
        const updated = await tx.variant.updateMany({
          where: { id: item.variantId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });

        if (updated.count === 0) {
          const variant = variants.find((v) => v.id === item.variantId)!;
          throw new Error(`Stok "${variant.product.name} (${variant.size})" gak cukup`);
        }
      }

      // 3. Ganti total item pesanan: hapus yang lama, buat yang baru
      await tx.orderItem.deleteMany({ where: { orderId: id } });

      return tx.order.update({
        where: { id },
        data: {
          totalAmount,
          items: {
            create: newItems.map((item) => {
              const variant = variants.find((v) => v.id === item.variantId)!;
              return {
                variantId: item.variantId,
                quantity: item.quantity,
                price: variant.product.price,
              };
            }),
          },
        },
        include: {
          member: true,
          items: { include: { variant: { include: { product: true } } } },
        },
      });
    });

    return NextResponse.json({
      message: 'Item pesanan berhasil diperbarui',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Edit order items error:', error);
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan pada server';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
