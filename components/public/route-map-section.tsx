'use client';

import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { Route as RouteIcon, Flag, MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const RoutePreviewMap = dynamic(() => import('@/components/public/route-preview-map').then((mod) => mod.RoutePreviewMap), { ssr: false, loading: () => <div className="h-full w-full animate-pulse bg-muted" /> });

interface RouteWithEvent {
  id: string;
  points: { lat: number; lng: number }[];
  distanceKm: number;
  startLabel: string | null;
  finishLabel: string | null;
  event: {
    name: string;
    eventDate: string;
  };
}

async function fetchRoutes(): Promise<RouteWithEvent[]> {
  const res = await fetch('/api/routes');
  if (!res.ok) throw new Error('Gagal memuat rute');
  const data = await res.json();
  return data.routes;
}

export function RouteMapSection() {
  const { data: routes, isLoading } = useQuery({
    queryKey: ['public-routes'],
    queryFn: fetchRoutes,
  });

  // API udah ordering desc by event.eventDate, jadi index 0 = rute paling baru
  const latestRoute = routes?.[0];

  return (
    <section id="route" className="mx-auto max-w-5xl scroll-mt-20 px-6 py-20 lg:px-8">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-black uppercase italic text-primaryBlack dark:text-primaryWhite sm:text-4xl">Rute Terbaru</h2>
        <p className="mt-2 text-[15px] text-muted-foreground">Intip jalur lari yang udah pernah kita tempuh bareng</p>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 w-full rounded-2xl" />
      ) : latestRoute ? (
        <div className="overflow-hidden rounded-2xl border border-border">
          <div className="h-72 w-full">
            <RoutePreviewMap points={latestRoute.points} />
          </div>

          <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Event</p>
              <p className="font-medium text-primaryBlack dark:text-primaryWhite">{latestRoute.event.name}</p>
            </div>

            <div className="flex items-center gap-2">
              <RouteIcon size={16} className="text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Jarak</p>
                <p className="font-medium text-primaryBlack dark:text-primaryWhite">{latestRoute.distanceKm} KM</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Start &amp; Finish</p>
                <p className="font-medium text-primaryBlack dark:text-primaryWhite">
                  {latestRoute.startLabel ?? '-'}
                  {latestRoute.finishLabel ? ` → ${latestRoute.finishLabel}` : ''}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
          <Flag size={28} />
          <p className="text-sm">Belum ada rute yang dipublikasikan</p>
        </div>
      )}
    </section>
  );
}
