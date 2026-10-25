'use client';

import { CheckCircle2, XCircle, MinusCircle, History } from 'lucide-react';
import { useMyEvents, type MyRegistration } from '@/hooks/use-my-events';
import { Skeleton } from '@/components/ui/skeleton';

const statusIcon = {
  CHECKED_IN: <CheckCircle2 size={18} className="text-primaryBlack dark:text-primaryWhite" />,
  ABSENT: <XCircle size={18} className="text-muted-foreground" />,
  REGISTERED: <MinusCircle size={18} className="text-muted-foreground" />,
};

function groupByMonth(registrations: MyRegistration[]) {
  const groups: Record<string, MyRegistration[]> = {};

  registrations.forEach((reg) => {
    const date = new Date(reg.event.eventDate);
    const key = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    if (!groups[key]) groups[key] = [];
    groups[key].push(reg);
  });

  return groups;
}

export default function AttendanceHistoryPage() {
  const { data, isLoading } = useMyEvents();

  const groups = data?.past ? groupByMonth(data.past) : {};
  const monthKeys = Object.keys(groups);

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-primaryBlack dark:text-primaryWhite">Riwayat Kehadiran</h1>
        <p className="text-[15px] text-muted-foreground">Rekam jejak partisipasi kamu di Kawan Pelarian</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : monthKeys.length > 0 ? (
        <div className="space-y-6">
          {monthKeys.map((month) => (
            <div key={month} className="space-y-2">
              <h2 className="text-sm font-medium text-muted-foreground">{month}</h2>
              <div className="overflow-hidden rounded-xl border border-border">
                {groups[month].map((reg, index) => (
                  <div key={reg.id} className={`flex items-center gap-3 px-4 py-3 ${index !== groups[month].length - 1 ? 'border-b border-border' : ''}`}>
                    {statusIcon[reg.status]}
                    <span className="text-sm text-primaryBlack dark:text-primaryWhite">{reg.event.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
          <History size={28} />
          <p className="text-sm">Belum ada riwayat kehadiran</p>
        </div>
      )}
    </div>
  );
}
