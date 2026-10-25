// app/admin/(dashboard)/dashboard/page.tsx
'use client';

import { Users, CalendarDays, ClipboardList, CheckCircle2, Package } from 'lucide-react';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';
import { StatCard } from '@/components/admin/stat-card';
import { RegistrationsChart } from '@/components/admin/registrations-chart';
import { OrderStatusChart } from '@/components/admin/order-status-chart';

export default function AdminDashboardPage() {
  const { data, isLoading } = useDashboardStats();

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-primaryBlack dark:text-primaryWhite">Dashboard</h1>
        <p className="text-[15px] text-muted-foreground">Ringkasan statistik komunitas Kawan Pelarian</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Member" value={data?.totalMember ?? 0} icon={Users} isLoading={isLoading} />
        <StatCard label="Total Event" value={data?.totalEvent ?? 0} icon={CalendarDays} isLoading={isLoading} />
        <StatCard label="Total Registrasi" value={data?.totalRegistration ?? 0} icon={ClipboardList} isLoading={isLoading} />
        <StatCard label="Total Kehadiran" value={data?.totalAttendance ?? 0} icon={CheckCircle2} isLoading={isLoading} />
        <StatCard label="Pesanan Pending" value={data?.pendingOrders ?? 0} icon={Package} isLoading={isLoading} href="/admin/orders?status=PENDING" highlight={(data?.pendingOrders ?? 0) > 0} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RegistrationsChart />
        <OrderStatusChart />
      </div>
    </div>
  );
}
