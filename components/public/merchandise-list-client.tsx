// components/public/merchandise-list-client.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag } from 'lucide-react';
import { useProducts } from '@/hooks/use-products';
import { useStoreStatus } from '@/hooks/use-store-status';
import { PreorderClosedBanner } from '@/components/public/preorder-closed-banner';
import { EventPageChrome } from '@/components/shared/event-page-chrome';
import { Skeleton } from '@/components/ui/skeleton';

export function MerchandiseListClient() {
  const { data: products, isLoading } = useProducts();
  const { data: storeStatus } = useStoreStatus();
  const ordersClosed = storeStatus?.ordersOpen === false;

  return (
    <EventPageChrome>
      <div className="mx-auto max-w-6xl space-y-8 px-6 py-10 lg:px-8">
        <div className="space-y-1 text-center">
          <h1 className="font-title text-3xl font-black uppercase italic text-primaryBlack dark:text-primaryWhite">Merchandise</h1>
          <p className="text-[15px] text-muted-foreground">Dukung komunitas, pakai jersey Kawan Pelarian</p>
        </div>

        {ordersClosed && <PreorderClosedBanner />}

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-80 w-full rounded-xl" />
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);

              return (
                <Link key={product.id} href={`/merchandise/${product.slug}`} className="block overflow-hidden rounded-xl border border-border transition-colors hover:bg-accent">
                  <div className="relative aspect-square w-full bg-muted">
                    {product.imageUrl ? <Image src={product.imageUrl} alt={product.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" /> : null}
                    {totalStock === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold">Stok Habis</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1 p-4">
                    <h3 className="font-semibold text-primaryBlack dark:text-primaryWhite">{product.name}</h3>
                    <p className="text-sm font-medium text-muted-foreground">Rp{product.price.toLocaleString('id-ID')}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
            <ShoppingBag size={28} />
            <p className="text-sm">Belum ada produk yang dijual</p>
          </div>
        )}
      </div>
    </EventPageChrome>
  );
}
