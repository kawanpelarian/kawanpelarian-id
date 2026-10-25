// hooks/use-dashboard-stats.ts
import { useQuery } from '@tanstack/react-query';

interface DashboardStats {
  totalMember: number;
  totalEvent: number;
  totalRegistration: number;
  totalAttendance: number;
  pendingOrders: number;
  verifiedOrders: number;
  rejectedOrders: number;
}

async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch('/api/admin/dashboard/stats');

  if (!res.ok) {
    throw new Error('Gagal memuat statistik dashboard');
  }

  return res.json();
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
  });
}
