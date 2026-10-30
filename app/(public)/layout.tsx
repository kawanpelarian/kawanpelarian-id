import { PublicNavbar } from '@/components/public/public-navbar';
import { PublicFooter } from '@/components/public/public-footer';
import { ScrollToTopButton } from '@/components/public/scroll-to-top-button';
import { cn } from '@/lib/utils';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={cn('flex min-h-screen flex-col bg-background')}>
      <PublicNavbar />
      {/* pt-16 biar konten gak ketiban navbar yang fixed */}
      <main className="flex-1 pt-16">{children}</main>
      <PublicFooter />
      <ScrollToTopButton />
    </div>
  );
}
