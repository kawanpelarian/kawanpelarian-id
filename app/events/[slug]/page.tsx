import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { siteConfig } from '@/lib/site-config';
import { EventDetailClient } from '@/components/public/event-detail-client';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Ambil data event langsung dari DB (server-side), khusus buat generate metadata.
// Terpisah dari fetch di client component (yang tetap lewat API buat interaktivitas).
async function getEventForMetadata(slug: string) {
  return prisma.event.findUnique({
    where: { slug, isPublished: true },
    select: {
      name: true,
      description: true,
      coverImageUrl: true,
      eventDate: true,
      meetingPoint: true,
    },
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventForMetadata(slug);

  if (!event) {
    return { title: 'Event Tidak Ditemukan' };
  }

  // Deskripsi dari Tiptap masih HTML, di-strip tag-nya dulu buat meta description
  const plainDescription = event.description
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160);

  const eventDateLabel = new Date(event.eventDate).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const title = event.name;
  const description = plainDescription || `${event.name} - ${eventDateLabel} di ${event.meetingPoint}`;
  const ogImage = event.coverImageUrl ?? siteConfig.ogImage;

  return {
    title,
    description,
    alternates: {
      canonical: `${siteConfig.url}/events/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}/events/${slug}`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: event.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getEventForMetadata(slug);

  if (!event) {
    notFound();
  }

  return <EventDetailClient />;
}
