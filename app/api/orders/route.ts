// app/api/orders/route.ts
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { cloudinary } from '@/lib/cloudinary';
import { resend } from '@/lib/resend';
import { rateLimit } from '@/lib/rate-limit';
import { getStoreSettings } from '@/lib/store-settings';
import { z } from 'zod';

const checkoutItemSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).max(20),
});

const checkoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1, 'Minimal 1 item'),
  note: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session || session.user.role !== 'MEMBER') {
    return NextResponse.json({ error: 'Tidak diizinkan' }, { status: 401 });
  }

  // Cegah spam order dari 1 member
  const { success } = rateLimit(`checkout:${session.user.id}`, {
    limit: 3,
    windowMs: 10 * 60 * 1000,
  });

  if (!success) {
    return NextResponse.json({ error: 'Terlalu banyak percobaan, coba lagi sebentar' }, { status: 429 });
  }

  // Pre-order ditutup admin -> tolak sebelum proses apapun (termasuk upload bukti)
  const { ordersOpen, currentBatch } = await getStoreSettings();

  if (!ordersOpen) {
    return NextResponse.json({ error: 'Pre-order batch ini sudah ditutup' }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const itemsRaw = formData.get('items') as string | null;
    const note = formData.get('note') as string | null;
    const proofFile = formData.get('proof') as File | null;

    if (!itemsRaw) {
      return NextResponse.json({ error: 'Item pesanan wajib diisi' }, { status: 400 });
    }

    const parsed = checkoutSchema.safeParse({
      items: JSON.parse(itemsRaw),
      note: note || undefined,
    });

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    if (!proofFile) {
      return NextResponse.json({ error: 'Bukti transfer wajib diupload' }, { status: 400 });
    }

    const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB
    if (proofFile.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Ukuran bukti transfer maksimal 8MB' }, { status: 400 });
    }

    if (!proofFile.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Bukti transfer harus berupa gambar' }, { status: 400 });
    }

    const { items, note: orderNote } = parsed.data;

    // Ambil semua variant yang dipesan sekaligus, biar 1 query
    const variantIds = items.map((i) => i.variantId);
    const variants = await prisma.variant.findMany({
      where: { id: { in: variantIds } },
      include: { product: true },
    });

    if (variants.length !== variantIds.length) {
      return NextResponse.json({ error: 'Ada produk yang gak ditemukan, coba refresh halaman' }, { status: 400 });
    }

    // Validasi stok SEBELUM upload apapun, biar gak buang-buang bandwidth
    // Cloudinary kalau ujung-ujungnya stok emang gak cukup
    for (const item of items) {
      const variant = variants.find((v) => v.id === item.variantId)!;
      if (!variant.product.isActive) {
        return NextResponse.json({ error: `Produk "${variant.product.name}" udah gak tersedia` }, { status: 400 });
      }
      if (variant.stock < item.quantity) {
        return NextResponse.json({ error: `Stok "${variant.product.name} (${variant.size})" gak cukup` }, { status: 400 });
      }
    }

    const totalAmount = items.reduce((sum, item) => {
      const variant = variants.find((v) => v.id === item.variantId)!;
      return sum + variant.product.price * item.quantity;
    }, 0);

    // Upload bukti transfer ke Cloudinary
    const arrayBuffer = await proofFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'kawan-pelarian/payment-proofs',
            public_id: randomUUID(),
            resource_type: 'image',
          },
          (error, result) => {
            if (error || !result) return reject(error);
            resolve(result);
          },
        )
        .end(buffer);
    });

    // Buat order + kurangin stok sekaligus dalam 1 transaksi (reserved,
    // bukan nunggu admin approve dulu - biar gak overselling pas nunggu verifikasi)
    const order = await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const updated = await tx.variant.updateMany({
          where: { id: item.variantId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });

        if (updated.count === 0) {
          throw new Error('STOCK_RACE_CONDITION');
        }
      }

      return tx.order.create({
        data: {
          memberId: session.user.id,
          totalAmount,
          proofUrl: uploadResult.secure_url,
          note: orderNote,
          batch: currentBatch,
          items: {
            create: items.map((item) => {
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
          items: { include: { variant: { include: { product: true } } } },
        },
      });
    });

    // Email konfirmasi order masuk, gak nge-block response kalau gagal
    try {
      const itemsSummary = order.items.map((item) => `${item.variant.product.name} (${item.variant.size}) x${item.quantity}`).join(', ');

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL as string,
        to: session.user.email as string,
        subject: 'Pesanan Diterima - Kawan Pelarian',
        html: `
          <div style="max-width: 480px; margin: 0 auto; font-family: -apple-system, sans-serif;">
            <div style="background: #162349; color: #ffffff; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
              <p style="margin: 0; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; opacity: 0.7;">Pesanan Diterima</p>
              <h1 style="margin: 8px 0 0; font-size: 20px;">Terima Kasih!</h1>
            </div>
            <div style="border: 2px dashed #162349; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
              <p style="margin: 0 0 16px; font-size: 15px;">
                Halo <strong>${session.user.name}</strong>, pesanan kamu udah kami terima dan
                lagi diverifikasi.
              </p>
              <p style="margin: 0 0 8px; font-size: 14px;"><strong>Batch:</strong> ${order.batch}</p>
              <p style="margin: 0 0 8px; font-size: 14px;"><strong>Item:</strong> ${itemsSummary}</p>
              <p style="margin: 0; font-size: 14px;"><strong>Total:</strong> Rp${totalAmount.toLocaleString('id-ID')}</p>
              <p style="margin: 20px 0 0; font-size: 13px; color: #737373; text-align: center;">
                Kami bakal kabarin lagi begitu pembayaran terverifikasi.
              </p>
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Gagal kirim email konfirmasi order:', emailError);
    }

    // Notif ke semua admin biar gak perlu buka dashboard manual tiap saat
    try {
      const admins = await prisma.admin.findMany({ select: { email: true } });
      const itemsSummary = order.items.map((item) => `${item.variant.product.name} (${item.variant.size}) x${item.quantity}`).join(', ');

      if (admins.length > 0) {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL as string,
          to: admins.map((a) => a.email),
          subject: `Pesanan Baru Masuk - ${session.user.name}`,
          html: `
            <div style="max-width: 480px; margin: 0 auto; font-family: -apple-system, sans-serif;">
              <div style="background: #162349; color: #ffffff; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
                <p style="margin: 0; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; opacity: 0.7;">Pesanan Baru</p>
                <h1 style="margin: 8px 0 0; font-size: 20px;">Perlu Diverifikasi</h1>
              </div>
              <div style="border: 2px dashed #162349; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
                <p style="margin: 0 0 8px; font-size: 14px;"><strong>Pemesan:</strong> ${session.user.name}</p>
                <p style="margin: 0 0 8px; font-size: 14px;"><strong>Item:</strong> ${itemsSummary}</p>
                <p style="margin: 0; font-size: 14px;"><strong>Total:</strong> Rp${totalAmount.toLocaleString('id-ID')}</p>
                <p style="margin: 20px 0 0; font-size: 13px; color: #737373; text-align: center;">
                  Buka dashboard admin buat cek bukti transfer dan verifikasi.
                </p>
              </div>
            </div>
          `,
        });
      }
    } catch (emailError) {
      console.error('Gagal kirim email notif admin:', emailError);
    }

    return NextResponse.json({ message: 'Pesanan berhasil dibuat', order }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'STOCK_RACE_CONDITION') {
      return NextResponse.json({ error: 'Stok abis pas kamu checkout, coba pilih varian lain' }, { status: 409 });
    }
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
