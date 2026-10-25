import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    ...(process.env.NODE_ENV === 'development' && { minimumCacheTTL: 60 }),
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },

  outputFileTracingIncludes: {
    '/p/**': ['./assets/fonts/**/*', './public/images/**/*'],
  },
};

export default nextConfig;
