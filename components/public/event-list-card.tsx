import Link from 'next/link';
import Image from 'next/image';
import { CalendarDays, MapPin, Users } from 'lucide-react';
import type { PublicEvent } from '@/hooks/use-member-events';

export function EventListCard({ event }: { event: PublicEvent }) {
  return (
    <Link href={`/events/${event.slug}`} className="block overflow-hidden rounded-xl border border-border transition-colors hover:bg-accent">
      <div className="relative aspect-square w-full bg-muted">
        {event.coverImageUrl ? <Image src={event.coverImageUrl} alt={event.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" /> : null}
      </div>

      <div className="space-y-2 p-4">
        <h3 className="font-semibold text-primaryBlack dark:text-primaryWhite">{event.name}</h3>

        <div className="space-y-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CalendarDays size={14} />
            <span>
              {new Date(event.eventDate).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} />
            <span>{event.meetingPoint}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={14} />
            <span>
              {event._count.registrations}/{event.quota} peserta
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
