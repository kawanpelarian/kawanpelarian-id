// app/api/admin/orders/[id]/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { resend } from '@/lib/resend';
import { getOrderStatusEmailHtml } from '@/lib/email-templates';
import { rateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

interface Params {
  params: Promise<{ id: string }>;
}

const updateOrderSchema = z.object({
  status: z.enum(['PENDING', 'VERIFIED', 'REJECTED']),
  rejectReason: z.string().optional(),
});

export async function GET(request: Request, { params }: Params) {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      member: { select: { id: true, name: true, email: true, phone: true } },
      items: {
        include: {
          variant: { include: { product: { select: { name: true, imageUrl: true } } } },
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
  }

  return NextResponse.json({ order });
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  const { success } = rateLimit(`admin-order-update:${session.user.id}`, {
    limit: 30,
    windowMs: 60 * 1000,
  });

  if (!success) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan, coba lagi sebentar' }, { status: 429 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = updateOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { status: newStatus, rejectReason } = parsed.data;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        member: true,
        items: { include: { variant: { include: { product: true } } } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 });
    }

    // Stok udah dikurangin pas order dibuat (reserved). Kalau status berubah
    // JADI REJECTED, stok dikembaliin. Kalau berubah DARI REJECTED ke status
    // lain, stok dikurangin lagi (dicek dulu cukup apa enggak).
    const becomingRejected = newStatus === 'REJECTED' && order.status !== 'REJECTED';
    const undoingRejection = order.status === 'REJECTED' && newStatus !== 'REJECTED';

    const updatedOrder = await prisma.$transaction(async (tx) => {
      if (becomingRejected) {
        for (const item of order.items) {
          await tx.variant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      if (undoingRejection) {
        for (const item of order.items) {
          const variant = await tx.variant.findUnique({ where: { id: item.variantId } });
          if (!variant || variant.stock < item.quantity) {
            throw new Error(`Stok "${item.variant.product.name} (${item.variant.size})" gak cukup buat konfirmasi ulang pesanan ini`);
          }
          await tx.variant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      return tx.order.update({
        where: { id },
        data: { status: newStatus },
        include: {
          member: true,
          items: { include: { variant: { include: { product: true } } } },
        },
      });
    });

    // Kirim email notif status, gak nge-block response kalau gagal
    if (newStatus === 'VERIFIED' || newStatus === 'REJECTED') {
      try {
        const itemsSummary = updatedOrder.items.map((item) => `${item.variant.product.name} (${item.variant.size}) x${item.quantity}`).join(', ');

        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL as string,
          to: updatedOrder.member.email as string,
          subject: newStatus === 'VERIFIED' ? 'Pembayaran Terverifikasi - Kawan Pelarian' : 'Update Pesanan - Kawan Pelarian',
          html: getOrderStatusEmailHtml({
            memberName: updatedOrder.member.name,
            orderId: updatedOrder.id,
            totalAmountLabel: `Rp${updatedOrder.totalAmount.toLocaleString('id-ID')}`,
            itemsSummary,
            status: newStatus,
            rejectReason,
          }),
        });
      } catch (emailError) {
        console.error('Gagal kirim email status order:', emailError);
      }
    }

    return NextResponse.json({ message: 'Status pesanan berhasil diperbarui', order: updatedOrder });
  } catch (error) {
    console.error('Update order error:', error);
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan pada server';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
