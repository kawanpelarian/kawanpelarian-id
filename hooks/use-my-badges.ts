// hooks/use-my-badges.ts
import { useQuery } from '@tanstack/react-query';

async function fetchMyBadges(): Promise<{ attendedCount: number }> {
  const res = await fetch('/api/profile/badges');
  if (!res.ok) throw new Error('Gagal memuat lencana');
  return res.json();
}

export function useMyBadges() {
  return useQuery({
    queryKey: ['my-badges'],
    queryFn: fetchMyBadges,
  });
}
