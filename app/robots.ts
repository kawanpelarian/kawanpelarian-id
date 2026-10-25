import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site-config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Halaman member/admin gak perlu di-index Google
        disallow: ['/admin', '/profile', '/my-events', '/attendance', '/api'],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
