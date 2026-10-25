// hooks/use-products.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface PublicVariant {
  id: string;
  size: string;
  stock: number;
}

export interface PublicProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  images: { id: string; url: string }[];
  variants: PublicVariant[];
}

async function fetchProducts(): Promise<PublicProduct[]> {
  const res = await fetch('/api/products');
  if (!res.ok) throw new Error('Gagal memuat produk');
  const data = await res.json();
  return data.products;
}

export function useProducts() {
  return useQuery({ queryKey: ['public-products'], queryFn: fetchProducts });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['public-products'],
    queryFn: fetchProducts,
    select: (products) => products.find((p) => p.slug === slug),
  });
}

export interface MyOrderItem {
  id: string;
  quantity: number;
  price: number;
  variant: {
    size: string;
    product: { name: string; imageUrl: string | null };
  };
}

export interface MyOrder {
  id: string;
  totalAmount: number;
  proofUrl: string | null;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  note: string | null;
  batch: number;
  createdAt: string;
  items: MyOrderItem[];
}

async function fetchMyOrders(): Promise<MyOrder[]> {
  const res = await fetch('/api/orders/me');
  if (!res.ok) throw new Error('Gagal memuat riwayat pesanan');
  const data = await res.json();
  return data.orders;
}

export function useMyOrders() {
  return useQuery({ queryKey: ['my-orders'], queryFn: fetchMyOrders });
}

interface CheckoutPayload {
  items: { variantId: string; quantity: number }[];
  note?: string;
  proof: File;
}

export function useCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ items, note, proof }: CheckoutPayload) => {
      const formData = new FormData();
      formData.append('items', JSON.stringify(items));
      if (note) formData.append('note', note);
      formData.append('proof', proof);

      const res = await fetch('/api/orders', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Gagal membuat pesanan');
      return data.order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      queryClient.invalidateQueries({ queryKey: ['public-products'] });
    },
  });
}
