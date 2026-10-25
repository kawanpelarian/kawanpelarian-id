import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

export interface PublicEvent {
  id: string;
  name: string;
  slug: string;
  coverImageUrl: string | null;
  eventDate: string;
  eventTime: string;
  meetingPoint: string;
  quota: number;
  registrationClosed: boolean;
  _count: { registrations: number };
}

export interface PublicEventDetail extends PublicEvent {
  description: string;
  isRegisteredByMe: boolean;
  myRegistrationId: string | null;
  myRegistrationStatus: 'REGISTERED' | 'CHECKED_IN' | 'ABSENT' | null;
  route: {
    points: unknown;
    distanceKm: number;
    startLabel: string | null;
    finishLabel: string | null;
  } | null;
  album: {
    id: string;
    name: string;
    photos: { id: string; url: string }[];
  } | null;
}

async function fetchEvents(): Promise<PublicEvent[]> {
  const res = await fetch('/api/events');
  if (!res.ok) throw new Error('Gagal memuat daftar event');
  const data = await res.json();
  return data.events;
}

export function useEvents() {
  return useQuery({
    queryKey: ['public-events'],
    queryFn: fetchEvents,
  });
}

async function fetchEventDetail(slug: string): Promise<PublicEventDetail> {
  const res = await fetch(`/api/events/${slug}`);
  if (!res.ok) throw new Error('Gagal memuat detail event');
  const data = await res.json();
  return data.event;
}

export function useEventDetail(slug: string) {
  const { data: session, status } = useSession();
  // userId disertain di query key biar cache "public-events" per slug itu
  // kepisah antar sesi login yang beda (atau belum login sama sekali).
  // Tanpa ini, data isRegisteredByMe dari sesi lama bisa ke-cache dan
  // gak otomatis refetch pas ganti akun/login ulang.
  const identityKey = status === 'loading' ? 'loading' : (session?.user.id ?? 'guest');

  return useQuery({
    queryKey: ['public-events', slug, identityKey],
    queryFn: () => fetchEventDetail(slug),
    enabled: !!slug && status !== 'loading',
  });
}

export function useRegisterEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Gagal mendaftar event');
      return data.registration;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
      queryClient.invalidateQueries({ queryKey: ['public-events'] });
    },
  });
}
