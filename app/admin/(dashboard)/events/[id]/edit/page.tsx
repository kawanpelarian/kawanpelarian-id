// app/admin/(dashboard)/events/[id]/edit/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useAdminEventDetail, useUpdateEvent } from '@/hooks/use-admin-events';
import { EventForm } from '@/components/admin/event-form';
import { RouteBuilderForm, type RouteFormValues } from '@/components/admin/route-builder-form';
import { Button } from '@/components/ui/button';
import type { EventInput } from '@/schemas/event.schema';

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const { data: event, isLoading } = useAdminEventDetail(eventId);
  const updateEvent = useUpdateEvent(eventId);

  const [eventValues, setEventValues] = useState<EventInput | null>(null);
  const [routeValues, setRouteValues] = useState<RouteFormValues>({
    waypoints: [],
    line: [],
    distanceKm: null,
    startLabel: '',
    finishLabel: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Isi form pas data event pertama kali kebaca dari server
  useEffect(() => {
    if (!event) return;

    setEventValues({
      name: event.name,
      slug: event.slug,
      description: event.description,
      coverImageUrl: event.coverImageUrl,
      eventDate: event.eventDate.slice(0, 10),
      eventTime: event.eventTime,
      meetingPoint: event.meetingPoint,
      quota: event.quota,
    });

    if (event.route) {
      const routePoints = event.route.points as { lat: number; lng: number }[];
      setRouteValues({
        waypoints: routePoints,
        line: routePoints,
        distanceKm: event.route.distanceKm,
        startLabel: event.route.startLabel ?? '',
        finishLabel: event.route.finishLabel ?? '',
      });
    }
  }, [event]);

  const handleSubmit = async (values: EventInput) => {
    setIsSubmitting(true);

    try {
      await updateEvent.mutateAsync(values);

      const hasRoute = routeValues.waypoints.length >= 2 && routeValues.distanceKm;

      if (hasRoute) {
        const routeLine = routeValues.line.length > 0 ? routeValues.line : routeValues.waypoints;

        const res = await fetch(`/api/admin/events/${eventId}/route-builder`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            points: routeLine,
            distanceKm: routeValues.distanceKm,
            startLabel: routeValues.startLabel || null,
            finishLabel: routeValues.finishLabel || null,
          }),
        });

        if (!res.ok) {
          toast.error('Event tersimpan, tapi rute gagal disimpan.');
          return;
        }
      } else if (event?.route) {
        // Rute sebelumnya ada tapi sekarang dikosongin admin -> hapus rute
        await fetch(`/api/admin/events/${eventId}/route-builder`, { method: 'DELETE' });
      }

      toast.success('Event berhasil diperbarui');
      router.push('/admin/events');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal memperbarui event');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !eventValues) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 overflow-x-hidden overflow-y-visible">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-primaryBlack dark:text-primaryWhite">Edit Event</h1>
        <p className="text-[15px] text-muted-foreground">{event?.name}</p>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-medium text-primaryBlack dark:text-primaryWhite">Route Builder</h2>
        <p className="text-sm text-muted-foreground">Perubahan rute ikut tersimpan otomatis pas kamu klik &quot;Simpan Perubahan&quot; di bawah.</p>
        <RouteBuilderForm value={routeValues} onChange={setRouteValues} />
      </div>

      <div className="space-y-3 border-t border-border pt-8">
        <h2 className="text-lg font-medium text-primaryBlack dark:text-primaryWhite">Detail Event</h2>
        <EventForm defaultValues={eventValues} onSubmit={handleSubmit} isSubmitting={isSubmitting} submitLabel="Simpan Perubahan" />
      </div>
    </div>
  );
}
