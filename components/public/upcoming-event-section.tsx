'use client';

import Link from 'next/link';
import Image from 'next/image';
import { CalendarDays, MapPin, Users, ArrowRight } from 'lucide-react';
import { useEvents } from '@/hooks/use-member-events';
import { getEventDateTime } from '@/lib/get-event-datetime';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function UpcomingEventSection() {
  const { data: events, isLoading } = useEvents();

  const now = new Date();
  const upcomingEvents = events?.filter((e) => getEventDateTime(e.eventDate, e.eventTime) >= now) ?? [];
  const pastEvents = events?.filter((e) => getEventDateTime(e.eventDate, e.eventTime) < now) ?? [];

  const nearestEvent =
    upcomingEvents.length > 0
      ? upcomingEvents[0] // udah ascending, jadi ini yang paling deket ke depan
      : pastEvents.length > 0
        ? pastEvents[pastEvents.length - 1] // ascending -> terakhir = paling baru lewatnya
        : undefined;

  const isPastFeatured = nearestEvent && new Date(nearestEvent.eventDate) < now;

  return (
    <section id="events-preview" className="mx-auto max-w-5xl px-6 py-20 lg:px-8">
      <div className="mb-10 text-center">
        <h2 className="font-title text-3xl font-black uppercase italic text-primaryBlack dark:text-primaryWhite sm:text-4xl">{isPastFeatured ? 'Event Terakhir' : 'Event Terdekat'}</h2>
        <p className="mt-2 text-[15px] text-muted-foreground">{isPastFeatured ? 'Serunya lari bareng di event terakhir kita' : 'Jangan sampai ketinggalan, gabung lari bareng kita minggu ini'}</p>
      </div>

      {isLoading ? (
        <Skeleton className="h-80 w-full rounded-2xl" />
      ) : nearestEvent ? (
        <div className="overflow-hidden rounded-2xl border border-border">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="relative h-64 w-full bg-muted md:h-full">
              {nearestEvent.coverImageUrl ? <Image src={nearestEvent.coverImageUrl} alt={nearestEvent.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" /> : null}
            </div>

            <div className="flex flex-col justify-center gap-4 p-8">
              <h3 className="text-2xl font-bold text-primaryBlack dark:text-primaryWhite">{nearestEvent.name}</h3>

              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CalendarDays size={16} />
                  <span>
                    {new Date(nearestEvent.eventDate).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                    , {nearestEvent.eventTime}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  <span>{nearestEvent.meetingPoint}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} />
                  <span>
                    {nearestEvent._count.registrations}/{nearestEvent.quota} peserta
                  </span>
                </div>
              </div>

              <Button
                size="lg"
                className="mt-2 w-fit rounded-full bg-primaryBlack px-8 text-primaryWhite hover:bg-primaryBlack/90 dark:bg-primaryWhite dark:text-primaryBlack dark:hover:bg-primaryWhite/90"
                render={<Link href={`/events/${nearestEvent.slug}`} />}
                nativeButton={false}
              >
                Lihat Detail & Daftar
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
          <CalendarDays size={28} />
          <p className="text-sm">Belum ada event yang dijadwalkan, stay tuned ya!</p>
        </div>
      )}

      <div className="mt-8 text-center">
        <Button variant="ghost" render={<Link href="/events" />} nativeButton={false} className="rounded-full">
          Lihat Semua Event
          <ArrowRight size={16} />
        </Button>
      </div>
    </section>
  );
}
