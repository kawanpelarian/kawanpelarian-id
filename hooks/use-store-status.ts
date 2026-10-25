// hooks/use-store-status.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface StoreStatus {
  ordersOpen: boolean;
  currentBatch: number;
}

async function fetchStoreStatus(): Promise<StoreStatus> {
  const res = await fetch('/api/store-status');
  if (!res.ok) throw new Error('Gagal memuat status pre-order');
  return res.json();
}

export function useStoreStatus() {
  return useQuery({
    queryKey: ['store-status'],
    queryFn: fetchStoreStatus,
  });
}

async function patchStoreSettings(payload: { ordersOpen: boolean } | { startNewBatch: true }) {
  const res = await fetch('/api/admin/store-settings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Gagal mengubah pengaturan pre-order');
  return data as { message: string; ordersOpen: boolean; currentBatch: number };
}

export function useSetOrdersOpen() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ordersOpen: boolean) => patchStoreSettings({ ordersOpen }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-status'] });
    },
  });
}

export function useStartNewBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => patchStoreSettings({ startNewBatch: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-status'] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
  });
}
