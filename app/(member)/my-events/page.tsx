// app/(member)/my-events/page.tsx
'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { CalendarX } from 'lucide-react';
import { useMyEvents, useCheckIn, useCancelRegistration } from '@/hooks/use-my-events';
import { MyEventCard } from '@/components/member/my-event-card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function MyEventsPage() {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const { data, isLoading } = useMyEvents();
  const checkIn = useCheckIn();
  const cancelRegistration = useCancelRegistration();

  const handleCheckIn = (eventId: string) => {
    checkIn.mutate(eventId, {
      onSuccess: (result) => {
        toast.success('Check-in berhasil, selamat berlari!');
        if (result.newBadge) {
          toast.success(`Lencana baru: ${result.newBadge.name}! Cek di halaman Profil.`);
        }
      },
      onError: (error) => toast.error(error.message),
    });
  };

  const handleCancel = (registrationId: string) => {
    cancelRegistration.mutate(registrationId, {
      onSuccess: () => toast.success('Pendaftaran berhasil dibatalkan'),
      onError: (error) => toast.error(error.message),
    });
  };

  const list = tab === 'upcoming' ? data?.upcoming : data?.past;

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-primaryBlack dark:text-primaryWhite">Event Saya</h1>
        <p className="text-[15px] text-muted-foreground">Event yang pernah dan akan kamu ikuti</p>
      </div>

      <div className="flex gap-2 rounded-lg bg-muted p-1">
        <button
          type="button"
          onClick={() => setTab('upcoming')}
          className={cn('flex-1 rounded-md px-3 py-1.5 text-sm transition-colors', tab === 'upcoming' ? 'bg-background font-medium text-primaryBlack shadow-sm dark:text-primaryWhite' : 'text-muted-foreground')}
        >
          Mendatang
        </button>
        <button
          type="button"
          onClick={() => setTab('past')}
          className={cn('flex-1 rounded-md px-3 py-1.5 text-sm transition-colors', tab === 'past' ? 'bg-background font-medium text-primaryBlack shadow-sm dark:text-primaryWhite' : 'text-muted-foreground')}
        >
          Selesai
        </button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-56 w-full rounded-xl" />)
        ) : list && list.length > 0 ? (
          list.map((registration) => (
            <MyEventCard
              key={registration.id}
              registration={registration}
              onCheckIn={tab === 'upcoming' ? handleCheckIn : undefined}
              isCheckingIn={checkIn.isPending && checkIn.variables === registration.event.id}
              onCancel={tab === 'upcoming' ? handleCancel : undefined}
              isCancelling={cancelRegistration.isPending && cancelRegistration.variables === registration.id}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
            <CalendarX size={28} />
            <p className="text-sm">{tab === 'upcoming' ? 'Belum ada event yang akan datang' : 'Belum ada riwayat event'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
