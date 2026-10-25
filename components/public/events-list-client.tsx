'use client';

import { useState } from 'react';
import { CalendarDays, History } from 'lucide-react';
import { useEvents } from '@/hooks/use-member-events';
import { getEventDateTime } from '@/lib/get-event-datetime';
import { Skeleton } from '@/components/ui/skeleton';
import { EventPageChrome } from '@/components/shared/event-page-chrome';
import { EventListCard } from '@/components/public/event-list-card';
import { cn } from '@/lib/utils';

export function EventsListClient() {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const { data: events, isLoading } = useEvents();

  const now = new Date();
  const upcomingEvents = events?.filter((e) => getEventDateTime(e.eventDate, e.eventTime) >= now) ?? [];
  // Event lalu ditampilin dari yang paling baru lewat dulu (descending)
  const pastEvents =
    events
      ?.filter((e) => getEventDateTime(e.eventDate, e.eventTime) < now)
      .slice()
      .reverse() ?? [];

  const list = tab === 'upcoming' ? upcomingEvents : pastEvents;

  return (
    <EventPageChrome>
      <div className="mx-auto max-w-6xl space-y-8 px-6 py-10 lg:px-8">
        <div className="space-y-1 text-center">
          <h1 className="font-title text-3xl font-black uppercase italic text-primaryBlack dark:text-primaryWhite">Semua Event</h1>
          <p className="text-[15px] text-muted-foreground">Pilih event Pelan Pelan Lari yang mau kamu ikuti</p>
        </div>

        <div className="mx-auto flex w-full max-w-xs gap-2 rounded-lg bg-muted p-1">
          <button
            type="button"
            onClick={() => setTab('upcoming')}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
              tab === 'upcoming' ? 'bg-background font-medium text-primaryBlack shadow-sm dark:text-primaryWhite' : 'text-muted-foreground',
            )}
          >
            <CalendarDays size={14} />
            Mendatang
          </button>
          <button
            type="button"
            onClick={() => setTab('past')}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
              tab === 'past' ? 'bg-background font-medium text-primaryBlack shadow-sm dark:text-primaryWhite' : 'text-muted-foreground',
            )}
          >
            <History size={14} />
            Lalu
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-80 w-full rounded-xl" />
            ))}
          </div>
        ) : list.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((event) => (
              <EventListCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
            {tab === 'upcoming' ? <CalendarDays size={28} /> : <History size={28} />}
            <p className="text-sm">{tab === 'upcoming' ? 'Belum ada event mendatang yang dijadwalkan' : 'Belum ada riwayat event'}</p>
          </div>
        )}
      </div>
    </EventPageChrome>
  );
}
