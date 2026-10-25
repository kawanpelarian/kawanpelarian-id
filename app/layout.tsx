import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/sonner';
import { siteConfig } from '@/lib/site-config';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/images/icon-512.png',
    shortcut: '/images/icon-512.png',
    apple: '/images/icon-512.png',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#162349',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning className={cn('h-full', 'antialiased', geistSans.variable, geistMono.variable, 'font-sans')}>
      <body className="min-h-full flex flex-col">
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
            <TooltipProvider delay={100}>
              {children}
              <Toaster richColors />
            </TooltipProvider>
          </ThemeProvider>
        </Providers>
        {process.env.NODE_ENV === 'production' && (
          <>
            <Script src="https://cloud.umami.is/script.js" data-website-id={process.env.NEXT_PUBLIC_UMAMI_ID} strategy="afterInteractive" />
            <Script type="module" src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon={`{"token": "${process.env.NEXT_PUBLIC_CF_BEACON_TOKEN}"}`} strategy="afterInteractive" crossOrigin="anonymous" />
          </>
        )}
      </body>
    </html>
  );
}
