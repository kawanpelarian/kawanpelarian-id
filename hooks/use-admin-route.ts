import { useMutation } from '@tanstack/react-query';
import type { RouteInput } from '@/schemas/route.schema';

export function useSaveRoute(eventId: string) {
  return useMutation({
    mutationFn: async (input: RouteInput) => {
      const res = await fetch(`/api/admin/events/${eventId}/route-builder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Gagal menyimpan rute');
      return data.route;
    },
  });
}
