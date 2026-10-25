// components/admin/registrations-chart.tsx
'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAdminEvents } from '@/hooks/use-admin-events';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function RegistrationsChart() {
  const { data: events, isLoading } = useAdminEvents();

  // Ambil 8 event terbaru aja, biar chart gak sesak
  const chartData = [...(events ?? [])]
    .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime())
    .slice(0, 8)
    .reverse()
    .map((event) => ({
      name: event.name.length > 14 ? `${event.name.slice(0, 14)}...` : event.name,
      registrasi: event._count.registrations,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Registrasi per Event</CardTitle>
        <p className="text-sm text-muted-foreground">8 event terbaru</p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : chartData.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">Belum ada data event</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                }}
              />
              <Bar dataKey="registrasi" fill="#fbdc00" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
