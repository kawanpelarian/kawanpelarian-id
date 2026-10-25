// app/(public)/page.tsx
import type { Metadata } from 'next';
import { HeroSection } from '@/components/public/hero-section';
import { AboutSection } from '@/components/public/about-section';
import { UpcomingEventSection } from '@/components/public/upcoming-event-section';
import { MerchandiseSection } from '@/components/public/merchandise-section';
// import { RouteMapSection } from "@/components/public/route-map-section";
import { GallerySection } from '@/components/public/gallery-section';
import { PartnersSection } from '@/components/public/partners-section';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Beranda',
  description: siteConfig.description,
  alternates: {
    canonical: siteConfig.url,
  },
};

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <AboutSection />
      <UpcomingEventSection />
      <MerchandiseSection />
      {/* <RouteMapSection /> */}
      <GallerySection />
      <PartnersSection />
    </div>
  );
}
