// hooks/use-my-events.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface MyRegistration {
  id: string;
  status: 'REGISTERED' | 'CHECKED_IN' | 'ABSENT';
  registeredAt: string;
  checkedInAt: string | null;
  started: boolean;
  checkInOpen: boolean;
  event: {
    id: string;
    name: string;
    slug: string;
    coverImageUrl: string | null;
    eventDate: string;
    eventTime: string;
    meetingPoint: string;
    checkInUntil: string | null;
  };
}

interface MyEventsResponse {
  upcoming: MyRegistration[];
  past: MyRegistration[];
}

async function fetchMyEvents(): Promise<MyEventsResponse> {
  const res = await fetch('/api/registrations/me');
  if (!res.ok) throw new Error('Gagal memuat event kamu');
  return res.json();
}

export function useMyEvents() {
  return useQuery({
    queryKey: ['my-events'],
    queryFn: fetchMyEvents,
  });
}

export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      const res = await fetch('/api/attendance/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Gagal check-in');
      return {
        registration: data.registration,
        attendedCount: data.attendedCount as number,
        newBadge: (data.newBadge ?? null) as { key: string; name: string } | null,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
      queryClient.invalidateQueries({ queryKey: ['my-badges'] });
    },
  });
}

export function useCancelRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (registrationId: string) => {
      const res = await fetch(`/api/registrations/${registrationId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Gagal membatalkan pendaftaran');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
      queryClient.invalidateQueries({ queryKey: ['public-events'] });
    },
  });
}
