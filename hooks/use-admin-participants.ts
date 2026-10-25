import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface ParticipantRow {
  id: string;
  status: 'REGISTERED' | 'CHECKED_IN' | 'ABSENT';
  registeredAt: string;
  checkedInAt: string | null;
  member: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}

interface ParticipantsSummary {
  registered: number;
  checkedIn: number;
  absent: number;
  total: number;
}

interface ParticipantsResponse {
  registrations: ParticipantRow[];
  summary: ParticipantsSummary;
}

async function fetchParticipants(eventId: string, search?: string, status?: string): Promise<ParticipantsResponse> {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (status) params.set('status', status);

  const res = await fetch(`/api/admin/events/${eventId}/participants?${params.toString()}`);
  if (!res.ok) throw new Error('Gagal memuat data peserta');
  return res.json();
}

export function useAdminParticipants(eventId: string, search?: string, status?: string) {
  return useQuery({
    queryKey: ['admin-participants', eventId, search, status],
    queryFn: () => fetchParticipants(eventId, search, status),
    enabled: !!eventId,
  });
}

export function useUpdateAttendanceStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ registrationId, status }: { registrationId: string; status: 'REGISTERED' | 'CHECKED_IN' | 'ABSENT' }) => {
      const res = await fetch(`/api/admin/registrations/${registrationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Gagal memperbarui status');
      return data.registration;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-participants'] });
    },
  });
}
