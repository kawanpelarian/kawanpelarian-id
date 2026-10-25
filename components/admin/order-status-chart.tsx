// components/admin/order-status-chart.tsx
'use client';

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = {
  Pending: '#fbdc00',
  Terverifikasi: '#bcf046',
  Ditolak: '#dc2626',
};

export function OrderStatusChart() {
  const { data, isLoading } = useDashboardStats();

  const chartData = [
    { name: 'Pending', jumlah: data?.pendingOrders ?? 0 },
    { name: 'Terverifikasi', jumlah: data?.verifiedOrders ?? 0 },
    { name: 'Ditolak', jumlah: data?.rejectedOrders ?? 0 },
  ];

  const totalOrders = chartData.reduce((sum, d) => sum + d.jumlah, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Status Pesanan Merchandise</CardTitle>
        <p className="text-sm text-muted-foreground">Total {totalOrders} pesanan</p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : totalOrders === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">Belum ada pesanan</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={90} />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                }}
              />
              <Bar dataKey="jumlah" radius={[0, 4, 4, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={COLORS[entry.name as keyof typeof COLORS]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
