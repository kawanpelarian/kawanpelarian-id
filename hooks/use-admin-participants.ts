// hooks/use-admin-participants.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export type PaymentStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface ParticipantRow {
  id: string;
  status: 'REGISTERED' | 'CHECKED_IN' | 'ABSENT';
  registeredAt: string;
  checkedInAt: string | null;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  proofUrl: string | null;
  paymentRejectReason: string | null;
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
  pendingPayment: number;
  revenue: number;
}

interface ParticipantsResponse {
  registrations: ParticipantRow[];
  summary: ParticipantsSummary;
}

async function fetchParticipants(eventId: string, search?: string, status?: string, payment?: string): Promise<ParticipantsResponse> {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (status) params.set('status', status);
  if (payment) params.set('payment', payment);

  const res = await fetch(`/api/admin/events/${eventId}/participants?${params.toString()}`);
  if (!res.ok) throw new Error('Gagal memuat data peserta');
  return res.json();
}

export function useAdminParticipants(eventId: string, search?: string, status?: string, payment?: string) {
  return useQuery({
    queryKey: ['admin-participants', eventId, search, status, payment],
    queryFn: () => fetchParticipants(eventId, search, status, payment),
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

export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ registrationId, status, rejectReason }: { registrationId: string; status: PaymentStatus; rejectReason?: string }) => {
      const res = await fetch(`/api/admin/registrations/${registrationId}/payment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, rejectReason }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Gagal memperbarui pembayaran');
      return data.registration;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-participants'] });
    },
  });
}
