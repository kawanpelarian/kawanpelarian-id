// hooks/use-public-event-participants.ts
import { useQuery } from '@tanstack/react-query';

export interface PublicParticipant {
  id: string;
  status: 'REGISTERED' | 'CHECKED_IN' | 'ABSENT';
  registeredAt: string;
  attendedCount: number;
  profileId: string | null;
  member: { name: string };
}

async function fetchParticipants(slug: string): Promise<PublicParticipant[]> {
  const res = await fetch(`/api/events/${slug}/participants`);
  if (!res.ok) throw new Error('Gagal memuat daftar peserta');
  const data = await res.json();
  return data.registrations;
}

export function usePublicEventParticipants(slug: string) {
  return useQuery({
    queryKey: ['public-event-participants', slug],
    queryFn: () => fetchParticipants(slug),
    enabled: !!slug,
  });
}
