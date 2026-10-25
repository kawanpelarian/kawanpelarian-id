// app/admin/(dashboard)/products/create/page.tsx
import { ProductForm } from '@/components/admin/product-form';

export default function CreateProductPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-primaryBlack dark:text-primaryWhite">Produk Baru</h1>
      <ProductForm />
    </div>
  );
}
