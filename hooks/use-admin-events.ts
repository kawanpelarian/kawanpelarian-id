// hooks/use-admin-events.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { EventInput, UpdateEventInput } from '@/schemas/event.schema';

interface AdminEvent {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverImageUrl: string | null;
  eventDate: string;
  eventTime: string;
  meetingPoint: string;
  quota: number;
  isPublished: boolean;
  registrationClosed: boolean;
  checkInUntil: string | null;
  _count: { registrations: number };
}

async function fetchAdminEvents(): Promise<AdminEvent[]> {
  const res = await fetch('/api/admin/events');
  if (!res.ok) throw new Error('Gagal memuat data event');
  const data = await res.json();
  return data.events;
}

export function useAdminEvents() {
  return useQuery({
    queryKey: ['admin-events'],
    queryFn: fetchAdminEvents,
  });
}

interface AdminEventDetail extends AdminEvent {
  route: {
    points: unknown;
    distanceKm: number;
    startLabel: string | null;
    finishLabel: string | null;
  } | null;
}

async function fetchAdminEventDetail(id: string): Promise<AdminEventDetail> {
  const res = await fetch(`/api/admin/events/${id}`);
  if (!res.ok) throw new Error('Gagal memuat detail event');
  const data = await res.json();
  return data.event;
}

export function useAdminEventDetail(id: string) {
  return useQuery({
    queryKey: ['admin-events', id],
    queryFn: () => fetchAdminEventDetail(id),
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: EventInput) => {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Gagal membuat event');
      return data.event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
    },
  });
}

export function useUpdateEvent(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateEventInput) => {
      const res = await fetch(`/api/admin/events/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Gagal memperbarui event');
      return data.event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/events/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Gagal menghapus event');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
    },
  });
}

export function useTogglePublishEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/events/${id}/publish`, {
        method: 'PATCH',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Gagal mengubah status publish');
      return data.event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
    },
  });
}

export function useToggleRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/events/${id}/registration`, {
        method: 'PATCH',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Gagal mengubah status pendaftaran');
      return data.event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
    },
  });
}

export type ExtendCheckInPayload = { addMinutes: number } | { until: string } | { reset: true };

export function useExtendCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: ExtendCheckInPayload }) => {
      const res = await fetch(`/api/admin/events/${id}/check-in`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Gagal memperpanjang check-in');
      return data as { message: string; event: { id: string; checkInUntil: string | null } };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events'] });
    },
  });
}
