import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site-config';
import { EventsListClient } from '@/components/public/events-list-client';

export const metadata: Metadata = {
  title: 'Semua Event',
  description: 'Daftar event lari mingguan Pelan Pelan Lari dari komunitas Kawan Pelarian.',
  alternates: {
    canonical: `${siteConfig.url}/events`,
  },
};

export default function EventsPage() {
  return <EventsListClient />;
}
