// app/admin/(dashboard)/products/[id]/edit/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useAdminProduct } from '@/hooks/use-admin-products';
import { ProductForm } from '@/components/admin/product-form';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading } = useAdminProduct(id);

  if (isLoading) {
    return (
      <div className="max-w-lg space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!product) {
    return <p className="text-muted-foreground">Produk tidak ditemukan</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-primaryBlack dark:text-primaryWhite">Edit Produk</h1>
      <ProductForm product={product} />
    </div>
  );
}
