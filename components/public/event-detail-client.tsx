// components/public/event-detail-client.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { CalendarDays, MapPin, Users, Clock, Loader2 } from 'lucide-react';
import { getEventDateTime } from '@/lib/get-event-datetime';
import { toTitleCase } from '@/lib/format-name';
import { sanitizeHtml } from '@/lib/sanitize-html';
import { useEventDetail, useRegisterEvent } from '@/hooks/use-member-events';
import { useCancelRegistration } from '@/hooks/use-my-events';
import { usePublicEventParticipants } from '@/hooks/use-public-event-participants';
import { AttendanceBadgeIcon } from '@/components/member/attendance-badge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EventPageChrome } from '@/components/shared/event-page-chrome';
import { CopyLinkButton } from '@/components/shared/copy-link-button';
import { siteConfig } from '@/lib/site-config';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function EventDetailClient() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const slug = params.slug as string;

  const { data: event, isLoading } = useEventDetail(slug);
  const registerEvent = useRegisterEvent();
  const cancelRegistration = useCancelRegistration();

  const handleCancel = () => {
    if (!event?.myRegistrationId) return;

    cancelRegistration.mutate(event.myRegistrationId, {
      onSuccess: () => {
        toast.success('Pendaftaran berhasil dibatalkan');
      },
      onError: (error) => toast.error(error.message),
    });
  };
  const { data: participants, isLoading: isParticipantsLoading } = usePublicEventParticipants(slug);

  const handleRegister = () => {
    if (!session) {
      toast.info('Masuk dulu buat daftar event ini');
      router.push('/login');
      return;
    }

    if (!event) return;

    if (getEventDateTime(event.eventDate, event.eventTime) < new Date()) {
      toast.error('Event ini sudah berlalu, pendaftaran ditutup');
      return;
    }

    if (event.registrationClosed) {
      toast.error('Pendaftaran untuk event ini udah ditutup');
      return;
    }

    registerEvent.mutate(event.id, {
      onSuccess: () => {
        toast.success('Berhasil daftar! Sampai jumpa di lokasi 🏃');
        router.push('/my-events');
      },
      onError: (error) => toast.error(error.message),
    });
  };

  if (isLoading) {
    return (
      <EventPageChrome>
        <div className="mx-auto max-w-md space-y-4 px-4 py-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-20 w-full" />
        </div>
      </EventPageChrome>
    );
  }

  if (!event) {
    return (
      <EventPageChrome>
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center text-muted-foreground">
          <p className="text-sm">Event tidak ditemukan</p>
        </div>
      </EventPageChrome>
    );
  }

  const isFull = event._count.registrations >= event.quota;
  const isPastEvent = getEventDateTime(event.eventDate, event.eventTime) < new Date();

  return (
    <EventPageChrome>
      <div className="mx-auto max-w-md space-y-6 px-4 py-6">
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted">
          {event.coverImageUrl ? <Image src={event.coverImageUrl} alt={event.name} fill sizes="(max-width: 768px) 100vw, 448px" className="object-cover" /> : null}
        </div>

        <div className="space-y-2">
          <h1 className="font-title text-2xl font-black uppercase italic text-primaryBlack dark:text-primaryWhite">{event.name}</h1>

          <CopyLinkButton url={`${siteConfig.url}/events/${event.slug}`} />
          <div className="prose prose-sm dark:prose-invert max-w-none text-[15px] text-muted-foreground" dangerouslySetInnerHTML={{ __html: sanitizeHtml(event.description) }} />
        </div>

        <div className="space-y-3 rounded-xl border border-border p-4">
          <div className="flex items-center gap-3 text-sm">
            <CalendarDays size={16} className="text-muted-foreground" />
            <span>
              {new Date(event.eventDate).toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Clock size={16} className="text-muted-foreground" />
            <span>{event.eventTime} WIB</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <MapPin size={16} className="text-muted-foreground" />
            <span>{event.meetingPoint}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Users size={16} className="text-muted-foreground" />
            <span>
              {event._count.registrations}/{event.quota} peserta
            </span>
          </div>
          {event.route && (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground">Jarak:</span>
              <span>{event.route.distanceKm} KM</span>
            </div>
          )}
        </div>

        <Button type="button" size="lg" className="w-full" onClick={handleRegister} disabled={registerEvent.isPending || isFull || event.isRegisteredByMe || isPastEvent || event.registrationClosed}>
          {registerEvent.isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : isPastEvent ? (
            'Event Sudah Berlalu'
          ) : event.isRegisteredByMe ? (
            'Kamu Sudah Mendaftar Event Ini'
          ) : event.registrationClosed ? (
            'Pendaftaran Ditutup'
          ) : isFull ? (
            'Kuota Penuh'
          ) : (
            'Daftar Event'
          )}
        </Button>

        {event.isRegisteredByMe && event.myRegistrationStatus === 'REGISTERED' && !isPastEvent && (
          <Button type="button" variant="outline" className="w-full text-destructive hover:text-destructive" onClick={handleCancel} disabled={cancelRegistration.isPending}>
            {cancelRegistration.isPending ? <Loader2 size={16} className="animate-spin" /> : 'Batalkan Pendaftaran'}
          </Button>
        )}

        <div className="space-y-3">
          <h2 className="font-title text-lg font-bold uppercase italic text-primaryBlack dark:text-primaryWhite">Yang Sudah Daftar</h2>
          <p className="text-sm text-muted-foreground">{event._count.registrations} kawan udah siap lari bareng, gabung juga yuk!</p>

          <div className="overflow-hidden rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">No</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isParticipantsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-4 w-4" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="ml-auto h-5 w-16" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : participants && participants.length > 0 ? (
                  participants.map((participant, index) => (
                    <TableRow key={participant.id}>
                      <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                      <TableCell className="font-medium text-primaryBlack dark:text-primaryWhite">
                        {participant.profileId ? (
                          <Link href={`/members/${participant.profileId}`} className="hover:underline">
                            {toTitleCase(participant.member.name)}
                          </Link>
                        ) : (
                          toTitleCase(participant.member.name)
                        )}
                        <AttendanceBadgeIcon attendedCount={participant.attendedCount} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={participant.status === 'CHECKED_IN' ? 'default' : 'secondary'}>{participant.status === 'CHECKED_IN' ? 'Hadir' : 'Terdaftar'}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-20 text-center text-muted-foreground">
                      Jadi yang pertama daftar, yuk!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </EventPageChrome>
  );
}
