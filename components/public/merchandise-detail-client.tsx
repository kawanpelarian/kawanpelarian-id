// components/public/merchandise-detail-client.tsx
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { useProduct } from '@/hooks/use-products';
import { useStoreStatus } from '@/hooks/use-store-status';
import { PreorderClosedBanner } from '@/components/public/preorder-closed-banner';
import { ProductImageCarousel } from '@/components/public/product-image-carousel';
import { useCartStore } from '@/store/cart-store';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EventPageChrome } from '@/components/shared/event-page-chrome';
import { cn } from '@/lib/utils';

export function MerchandiseDetailClient() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const { data: product, isLoading } = useProduct(slug);
  const addItem = useCartStore((s) => s.addItem);
  const { data: storeStatus } = useStoreStatus();
  const ordersClosed = storeStatus?.ordersOpen === false;

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const selectedVariant = product?.variants.find((v) => v.size === selectedSize);

  const handleAddToCart = () => {
    if (ordersClosed) {
      toast.error('Pre-order batch ini sudah ditutup');
      return;
    }

    if (!session) {
      toast.info('Masuk dulu buat beli produk ini');
      router.push('/login');
      return;
    }

    if (!selectedVariant) {
      toast.error('Pilih ukuran dulu');
      return;
    }

    if (!product) return;

    addItem({
      variantId: selectedVariant.id,
      productName: product.name,
      size: selectedVariant.size,
      price: product.price,
      quantity,
      imageUrl: product.imageUrl,
      maxStock: selectedVariant.stock,
    });

    toast.success('Ditambahin ke keranjang');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    if (session && selectedVariant) {
      router.push('/checkout');
    }
  };

  if (isLoading) {
    return (
      <EventPageChrome>
        <div className="mx-auto max-w-3xl space-y-6 px-6 py-10 lg:px-8">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </EventPageChrome>
    );
  }

  if (!product) {
    return (
      <EventPageChrome>
        <div className="mx-auto max-w-3xl px-6 py-16 text-center text-muted-foreground">Produk gak ditemukan</div>
      </EventPageChrome>
    );
  }

  return (
    <EventPageChrome>
      <div className="mx-auto max-w-3xl space-y-6 px-6 py-10 lg:px-8">
        <ProductImageCarousel images={[...(product.imageUrl ? [product.imageUrl] : []), ...product.images.map((img) => img.url)]} alt={product.name} />

        <div className="space-y-2">
          <h1 className="font-title text-2xl font-black uppercase italic text-primaryBlack dark:text-primaryWhite">{product.name}</h1>
          <p className="text-lg font-semibold text-primaryBlack dark:text-primaryWhite">Rp{product.price.toLocaleString('id-ID')}</p>
          {product.description && <p className="whitespace-pre-line wrap-break-word text-sm text-muted-foreground">{product.description}</p>}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-primaryBlack dark:text-primaryWhite">Ukuran</p>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                disabled={variant.stock === 0}
                onClick={() => {
                  setSelectedSize(variant.size);
                  setQuantity(1);
                }}
                className={cn(
                  'rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40',
                  selectedSize === variant.size ? 'border-brandNavy bg-brandYellow text-brandNavy dark:border-brandYellow' : 'border-border text-primaryBlack dark:text-primaryWhite',
                )}
              >
                {variant.size}
                {variant.stock === 0 && ' (Habis)'}
              </button>
            ))}
          </div>
        </div>

        {selectedVariant && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-primaryBlack dark:text-primaryWhite">Jumlah</p>
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" size="icon" onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1}>
                <Minus size={14} />
              </Button>
              <span className="w-8 text-center text-sm font-medium">{quantity}</span>
              <Button type="button" variant="outline" size="icon" onClick={() => setQuantity((q) => Math.min(selectedVariant.stock, q + 1))} disabled={quantity >= selectedVariant.stock}>
                <Plus size={14} />
              </Button>
              <span className="text-xs text-muted-foreground">Stok tersisa: {selectedVariant.stock}</span>
            </div>
          </div>
        )}

        {ordersClosed && <PreorderClosedBanner />}

        <div className="flex gap-3">
          <Button type="button" size="lg" variant="outline" className="flex-1" onClick={handleAddToCart} disabled={!selectedSize || ordersClosed}>
            <ShoppingCart size={16} />
            Tambah ke Keranjang
          </Button>
          <Button type="button" size="lg" className="flex-1" onClick={handleBuyNow} disabled={!selectedSize || ordersClosed}>
            Beli Sekarang
          </Button>
        </div>
      </div>
    </EventPageChrome>
  );
}
