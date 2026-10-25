// app/admin/(dashboard)/events/create/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Check } from 'lucide-react';
import { useCreateEvent } from '@/hooks/use-admin-events';
import { EventForm } from '@/components/admin/event-form';
import { RouteBuilderForm, type RouteFormValues } from '@/components/admin/route-builder-form';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { EventInput } from '@/schemas/event.schema';

const steps = [
  { id: 1, label: 'Detail Event' },
  { id: 2, label: 'Route Builder' },
];

export default function CreateEventPage() {
  const router = useRouter();
  const createEvent = useCreateEvent();

  const [currentStep, setCurrentStep] = useState(1);
  const [eventValues, setEventValues] = useState<EventInput | null>(null);
  const [routeValues, setRouteValues] = useState<RouteFormValues>({
    waypoints: [],
    line: [],
    distanceKm: null,
    startLabel: '',
    finishLabel: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStep1Submit = (values: EventInput) => {
    setEventValues(values);
    setCurrentStep(2);
  };

  const handleFinalSubmit = async () => {
    if (!eventValues) return;

    setIsSubmitting(true);

    try {
      const event = await createEvent.mutateAsync(eventValues);

      const hasRoute = routeValues.waypoints.length >= 2 && routeValues.distanceKm;

      if (hasRoute) {
        const routeLine = routeValues.line.length > 0 ? routeValues.line : routeValues.waypoints;

        const res = await fetch(`/api/admin/events/${event.id}/route-builder`, {
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
          toast.error('Event tersimpan, tapi rute gagal disimpan. Coba edit lagi nanti.');
          router.push('/admin/events');
          return;
        }
      }

      toast.success('Event berhasil dibuat');
      router.push('/admin/events');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal membuat event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 overflow-x-hidden overflow-y-visible">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-primaryBlack dark:text-primaryWhite">Buat Event Baru</h1>
        <p className="text-[15px] text-muted-foreground">Isi detail event, lalu lanjut gambar rute lari</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-4 rounded-xl border border-border px-5 py-4">
        {steps.map((step, index) => {
          const isLastStep = index === steps.length - 1;
          return (
            <div key={step.id} className={cn('flex items-center gap-4', !isLastStep && 'flex-1')}>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium',
                    currentStep === step.id
                      ? 'border-brandNavy bg-brandYellow text-brandNavy dark:border-brandYellow'
                      : currentStep > step.id
                        ? 'border-primaryBlack bg-transparent text-primaryBlack dark:border-primaryWhite dark:text-primaryWhite'
                        : 'border-border text-muted-foreground',
                  )}
                >
                  {currentStep > step.id ? <Check size={14} /> : step.id}
                </div>
                <span className={cn('whitespace-nowrap text-sm', currentStep === step.id ? 'font-medium text-primaryBlack dark:text-primaryWhite' : 'text-muted-foreground')}>{step.label}</span>
              </div>
              {!isLastStep && <div className="h-px flex-1 bg-border" />}
            </div>
          );
        })}
      </div>

      {currentStep === 1 && <EventForm defaultValues={eventValues ?? undefined} onSubmit={handleStep1Submit} submitLabel="Lanjut ke Route Builder" />}

      {currentStep === 2 && (
        <div className="space-y-6">
          <RouteBuilderForm value={routeValues} onChange={setRouteValues} />

          <p className="text-sm text-muted-foreground">Rute bersifat opsional — kamu bisa lewati dan isi belakangan dari halaman edit event.</p>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setCurrentStep(1)} disabled={isSubmitting}>
              Kembali
            </Button>
            <Button type="button" onClick={handleFinalSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Buat Event'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
