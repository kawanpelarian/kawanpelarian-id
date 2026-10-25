import type { Metadata } from 'next';
import { Suspense } from 'react';
import { siteConfig } from '@/lib/site-config';
import { GalleryClient } from '@/components/public/gallery-client';

export const metadata: Metadata = {
  title: 'Galeri',
  description: 'Dokumentasi foto seluruh event Kawan Pelarian.',
  alternates: {
    canonical: `${siteConfig.url}/gallery`,
  },
};

export default function GalleryPage() {
  return (
    <Suspense fallback={null}>
      <GalleryClient />
    </Suspense>
  );
}
