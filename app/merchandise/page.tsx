// app/merchandise/page.tsx
import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site-config';
import { MerchandiseListClient } from '@/components/public/merchandise-list-client';

export const metadata: Metadata = {
  title: 'Merchandise',
  description: 'Jersey dan merchandise resmi Kawan Pelarian.',
  alternates: { canonical: `${siteConfig.url}/merchandise` },
};

export default function MerchandisePage() {
  return <MerchandiseListClient />;
}
