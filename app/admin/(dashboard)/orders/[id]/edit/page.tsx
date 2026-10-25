// app/admin/(dashboard)/orders/[id]/edit/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useAdminOrder, useUpdateOrderItems } from '@/hooks/use-admin-orders';
import { useAdminProducts } from '@/hooks/use-admin-products';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EditableItem {
  variantId: string;
  productName: string;
  size: string;
  price: number;
  quantity: number;
  stock: number; // stok yang tersedia SEKARANG (belum termasuk qty item ini,
  // makanya pas hitung max dibalikin dulu, lihat komentar di render)
  imageUrl: string | null;
}

export default function EditOrderItemsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: order, isLoading } = useAdminOrder(id);
  const { data: products, isLoading: isLoadingProducts } = useAdminProducts();
  const updateItems = useUpdateOrderItems();

  const [items, setItems] = useState<EditableItem[]>([]);
  const [addingProductId, setAddingProductId] = useState('');
  const [addingVariantId, setAddingVariantId] = useState('');

  useEffect(() => {
    if (!order) return;
    setItems(
      order.items.map((item) => ({
        variantId: item.variant.id,
        productName: item.variant.product.name,
        size: item.variant.size,
        price: item.price,
        quantity: item.quantity,
        stock: item.variant.stock,
        imageUrl: item.variant.product.imageUrl,
      })),
    );
  }, [order]);

  const handleQuantityChange = (variantId: string, quantity: number) => {
    setItems(items.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)));
  };

  const handleRemoveItem = (variantId: string) => {
    setItems(items.filter((i) => i.variantId !== variantId));
  };

  const addingProduct = products?.find((p) => p.id === addingProductId);

  const handleAddItem = () => {
    if (!addingProduct || !addingVariantId) return;
    const variant = addingProduct.variants.find((v) => v.id === addingVariantId);
    if (!variant) return;

    if (items.some((i) => i.variantId === variant.id)) {
      toast.error('Ukuran ini udah ada di daftar, tinggal ubah jumlahnya aja');
      return;
    }

    setItems([
      ...items,
      {
        variantId: variant.id,
        productName: addingProduct.name,
        size: variant.size,
        price: addingProduct.price,
        quantity: 1,
        stock: variant.stock,
        imageUrl: addingProduct.imageUrl,
      },
    ]);
    setAddingProductId('');
    setAddingVariantId('');
  };

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleSubmit = () => {
    if (items.length === 0) {
      toast.error('Pesanan minimal harus punya 1 item');
      return;
    }

    updateItems.mutate(
      {
        id,
        items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
      },
      {
        onSuccess: () => {
          toast.success('Item pesanan berhasil diperbarui');
          router.push(`/admin/orders/${id}`);
        },
        onError: (error) => toast.error(error.message),
      },
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-lg space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!order) {
    return <p className="text-muted-foreground">Pesanan tidak ditemukan</p>;
  }

  if (order.status === 'REJECTED') {
    return <p className="text-muted-foreground">Pesanan yang udah ditolak gak bisa diedit lagi.</p>;
  }

  return (
    <div className="max-w-lg space-y-6 pb-24 lg:pb-6">
      <div>
        <h1 className="text-xl font-semibold text-primaryBlack dark:text-primaryWhite">Edit Pesanan #{order.id.slice(-8).toUpperCase()}</h1>
        <p className="text-sm text-muted-foreground">Salah pilih ukuran/jumlah? Ubah di sini, stok otomatis disesuaikan.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Item Pesanan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.length === 0 && <p className="text-sm text-muted-foreground">Belum ada item, tambahin di bawah.</p>}

          {items.map((item) => {
            // Item ini lagi kepesan sejumlah quantity-nya, jadi stok yang
            // sebenernya "boleh dinaikin sampai" = stok sisa + quantity
            // sekarang (soalnya stok sisa itu belum ngitung punya dia sendiri)
            const maxQuantity = item.stock + item.quantity;

            return (
              <div key={item.variantId} className="flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">{item.imageUrl && <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" />}</div>
                <div className="flex-1 text-sm">
                  <p className="font-medium text-primaryBlack dark:text-primaryWhite">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.size} · Rp{item.price.toLocaleString('id-ID')}
                  </p>
                </div>
                <input
                  type="number"
                  min={1}
                  max={maxQuantity}
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(item.variantId, Math.max(1, Math.min(maxQuantity, Number(e.target.value))))}
                  className="h-8 w-16 rounded-md border border-input bg-background px-2 text-sm"
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem(item.variantId)}>
                  <Trash2 size={14} className="text-destructive" />
                </Button>
              </div>
            );
          })}

          <div className="flex items-center justify-between border-t border-border pt-3 text-sm font-semibold">
            <span>Total</span>
            <span>Rp{total.toLocaleString('id-ID')}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tambah Item</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoadingProducts ? (
            <Skeleton className="h-9 w-full" />
          ) : (
            <>
              <select
                value={addingProductId}
                onChange={(e) => {
                  setAddingProductId(e.target.value);
                  setAddingVariantId('');
                }}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Pilih produk...</option>
                {products?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              {addingProduct && (
                <select value={addingVariantId} onChange={(e) => setAddingVariantId(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="">Pilih ukuran...</option>
                  {addingProduct.variants.map((v) => (
                    <option key={v.id} value={v.id} disabled={v.stock === 0}>
                      {v.size} {v.stock === 0 ? '(Habis)' : `(stok ${v.stock})`}
                    </option>
                  ))}
                </select>
              )}

              <Button type="button" variant="outline" className="w-full" onClick={handleAddItem} disabled={!addingVariantId}>
                <Plus size={14} />
                Tambah ke Pesanan
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Button type="button" size="lg" className="hidden w-full lg:flex" onClick={handleSubmit} disabled={updateItems.isPending}>
        {updateItems.isPending ? <Loader2 size={16} className="animate-spin" /> : 'Simpan Perubahan'}
      </Button>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background p-4 lg:hidden">
        <Button type="button" size="lg" className="w-full" onClick={handleSubmit} disabled={updateItems.isPending}>
          {updateItems.isPending ? <Loader2 size={16} className="animate-spin" /> : 'Simpan Perubahan'}
        </Button>
      </div>
    </div>
  );
}
