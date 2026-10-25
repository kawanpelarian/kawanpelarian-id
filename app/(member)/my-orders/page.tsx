// app/(member)/my-orders/page.tsx
'use client';

import Image from 'next/image';
import { Package } from 'lucide-react';
import { useMyOrders } from '@/hooks/use-products';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const statusLabel = {
  PENDING: 'Menunggu Verifikasi',
  VERIFIED: 'Terverifikasi',
  REJECTED: 'Ditolak',
} as const;

const statusVariant = {
  PENDING: 'secondary',
  VERIFIED: 'default',
  REJECTED: 'destructive',
} as const;

export default function MyOrdersPage() {
  const { data: orders, isLoading } = useMyOrders();

  return (
    <div className="mx-auto max-w-lg space-y-6 px-6 py-10 pb-24">
      <h1 className="font-title text-2xl font-black uppercase italic text-primaryBlack dark:text-primaryWhite">Pesanan Saya</h1>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : orders && orders.length > 0 ? (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="space-y-3 rounded-xl border border-border p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                  {' · '}Batch {order.batch}
                </span>
                <Badge variant={statusVariant[order.status]}>{statusLabel[order.status]}</Badge>
              </div>

              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {item.variant.product.imageUrl && <Image src={item.variant.product.imageUrl} alt={item.variant.product.name} fill className="object-cover" />}
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="font-medium text-primaryBlack dark:text-primaryWhite">{item.variant.product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.variant.size} x{item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-border pt-2 text-sm font-semibold">
                <span>Total</span>
                <span>Rp{order.totalAmount.toLocaleString('id-ID')}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
          <Package size={28} />
          <p className="text-sm">Belum ada pesanan</p>
        </div>
      )}
    </div>
  );
}
