// hooks/use-admin-orders.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface AdminOrderItem {
  id: string;
  quantity: number;
  price: number;
  variant: {
    id: string;
    size: string;
    stock: number;
    product: { id: string; name: string; imageUrl: string | null };
  };
}

export interface AdminOrder {
  id: string;
  totalAmount: number;
  proofUrl: string | null;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  note: string | null;
  batch: number;
  createdAt: string;
  member: { id: string; name: string; email: string; phone: string | null };
  items: AdminOrderItem[];
}

async function fetchAdminOrders(status?: string, batch?: number): Promise<AdminOrder[]> {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (batch) params.set('batch', String(batch));

  const res = await fetch(`/api/admin/orders?${params.toString()}`);
  if (!res.ok) throw new Error('Gagal memuat pesanan');
  const data = await res.json();
  return data.orders;
}

// `batch` undefined = semua batch. `enabled` dipakai supaya halaman bisa
// nunggu batch aktif ke-load dulu sebelum fetch pertama.
export function useAdminOrders(status?: string, batch?: number, enabled = true) {
  return useQuery({
    queryKey: ['admin-orders', status, batch],
    queryFn: () => fetchAdminOrders(status, batch),
    enabled,
  });
}

async function fetchAdminOrder(id: string): Promise<AdminOrder> {
  const res = await fetch(`/api/admin/orders/${id}`);
  if (!res.ok) throw new Error('Gagal memuat pesanan');
  const data = await res.json();
  return data.order;
}

export function useAdminOrder(id: string) {
  return useQuery({
    queryKey: ['admin-order', id],
    queryFn: () => fetchAdminOrder(id),
    enabled: !!id,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, rejectReason }: { id: string; status: 'PENDING' | 'VERIFIED' | 'REJECTED'; rejectReason?: string }) => {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, rejectReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Gagal memperbarui status pesanan');
      return data.order;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-order', variables.id] });
    },
  });
}

export function useUpdateOrderItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, items }: { id: string; items: { variantId: string; quantity: number }[] }) => {
      const res = await fetch(`/api/admin/orders/${id}/items`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Gagal memperbarui item pesanan');
      return data.order;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-order', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });
}
