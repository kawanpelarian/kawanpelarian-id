// components/public/merchandise-section.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { useProducts } from '@/hooks/use-products';
import { useStoreStatus } from '@/hooks/use-store-status';
import { PreorderClosedBanner } from '@/components/public/preorder-closed-banner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function MerchandiseSection() {
  const { data: products, isLoading } = useProducts();
  const { data: storeStatus } = useStoreStatus();
  const ordersClosed = storeStatus?.ordersOpen === false;
  const featured = products?.slice(0, 3);
  const isEmpty = !isLoading && (!featured || featured.length === 0);

  return (
    <section id="merchandise" className="mx-auto max-w-5xl px-6 py-20 lg:px-8">
      <div className="mb-10 text-center">
        <h2 className="font-title text-3xl font-black uppercase italic text-primaryBlack dark:text-primaryWhite sm:text-4xl">Merchandise</h2>
        <p className="mt-2 text-[15px] text-muted-foreground">Dukung komunitas, pakai jersey Kawan Pelarian</p>
      </div>

      {ordersClosed && (
        <div className="mb-8">
          <PreorderClosedBanner />
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      ) : isEmpty ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
          <ShoppingBag size={28} />
          <p className="text-sm">Belum ada produk merchandise di sini</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {featured?.map((product) => {
            const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);

            return (
              <Link key={product.id} href={`/merchandise/${product.slug}`} className="block overflow-hidden rounded-xl border border-border transition-colors hover:bg-accent">
                <div className="relative aspect-square w-full bg-muted">
                  {product.imageUrl ? (
                    <Image src={product.imageUrl} alt={product.name} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ShoppingBag size={24} className="text-muted-foreground" />
                    </div>
                  )}
                  {totalStock === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold">Stok Habis</span>
                    </div>
                  )}
                </div>
                <div className="space-y-1 p-4">
                  <h3 className="text-sm font-semibold text-primaryBlack dark:text-primaryWhite">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">Rp{product.price.toLocaleString('id-ID')}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {!isEmpty && (
        <div className="mt-8 text-center">
          <Button variant="outline" className="rounded-full px-8" render={<Link href="/merchandise" />} nativeButton={false}>
            Lihat Semua Merchandise
            <ArrowRight size={16} />
          </Button>
        </div>
      )}
    </section>
  );
}
