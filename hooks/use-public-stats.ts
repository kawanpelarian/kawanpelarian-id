import { useQuery } from '@tanstack/react-query';

async function fetchStats(): Promise<{ totalMembers: number }> {
  const res = await fetch('/api/stats');
  if (!res.ok) throw new Error('Gagal memuat statistik');
  return res.json();
}

export function usePublicStats() {
  return useQuery({
    queryKey: ['public-stats'],
    queryFn: fetchStats,
  });
}
