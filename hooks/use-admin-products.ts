// hooks/use-admin-products.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ProductInput } from '@/schemas/product.schema';

export interface AdminVariant {
  id: string;
  size: string;
  stock: number;
}

export interface AdminProductImage {
  id: string;
  url: string;
}

export interface AdminProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  variants: AdminVariant[];
  images: AdminProductImage[];
}

async function fetchAdminProducts(): Promise<AdminProduct[]> {
  const res = await fetch('/api/admin/products');
  if (!res.ok) throw new Error('Gagal memuat produk');
  const data = await res.json();
  return data.products;
}

export function useAdminProducts() {
  return useQuery({ queryKey: ['admin-products'], queryFn: fetchAdminProducts });
}

async function fetchAdminProduct(id: string): Promise<AdminProduct> {
  const res = await fetch(`/api/admin/products/${id}`);
  if (!res.ok) throw new Error('Gagal memuat produk');
  const data = await res.json();
  return data.product;
}

export function useAdminProduct(id: string) {
  return useQuery({
    queryKey: ['admin-product', id],
    queryFn: () => fetchAdminProduct(id),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ProductInput) => {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Gagal membuat produk');
      return data.product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: ProductInput }) => {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Gagal memperbarui produk');
      return data.product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Gagal menghapus produk');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });
}
