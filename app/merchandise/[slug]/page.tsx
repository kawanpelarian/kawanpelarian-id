// app/merchandise/[slug]/page.tsx
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { siteConfig } from '@/lib/site-config';
import { MerchandiseDetailClient } from '@/components/public/merchandise-detail-client';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getProductForMetadata(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    select: { name: true, description: true, imageUrl: true, price: true },
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductForMetadata(slug);

  if (!product) {
    return { title: 'Produk Tidak Ditemukan' };
  }

  const title = product.name;
  const description = product.description ?? `${product.name} - Rp${product.price.toLocaleString('id-ID')}`;
  const ogImage = product.imageUrl ?? siteConfig.ogImage;

  return {
    title,
    description,
    alternates: {
      canonical: `${siteConfig.url}/merchandise/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}/merchandise/${slug}`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: product.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default function MerchandiseDetailPage() {
  return <MerchandiseDetailClient />;
}
