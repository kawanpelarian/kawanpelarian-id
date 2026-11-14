// hooks/use-scan.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface ScanPerson {
  name: string;
  avatarUrl: string | null;
}

export type ScanResult =
  | {
      ok: true;
      member: ScanPerson;
      eventName: string;
      attendedCount: number;
      newBadge: { key: string; name: string } | null;
    }
  | {
      ok: false;
      code: string;
      message: string;
      member?: ScanPerson;
      eventName?: string;
    };

export function useScanAccess() {
  return useQuery({
    queryKey: ['scan-access'],
    queryFn: async (): Promise<boolean> => {
      const res = await fetch('/api/scan/access');
      if (!res.ok) return false;
      const data = await res.json();
      return data.allowed === true;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useScanCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string): Promise<ScanResult> => {
      const res = await fetch('/api/scan/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      return res.json();
    },
    onSuccess: (result) => {
      if (result.ok) {
        queryClient.invalidateQueries({ queryKey: ['admin-participants'] });
      }
    },
  });
}
