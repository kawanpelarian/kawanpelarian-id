'use client';

import { useSession } from 'next-auth/react';
import { MemberTopBar } from '@/components/member/member-top-bar';
import { MemberBottomMenu } from '@/components/member/member-bottom-menu';
import { PublicNavbar } from '@/components/public/public-navbar';
import { ScrollToTopButton } from '@/components/public/scroll-to-top-button';
import { highCruiser } from '@/app/fonts';
import { cn } from '@/lib/utils';

export function EventPageChrome({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const isMember = status === 'authenticated' && session?.user.role === 'MEMBER';

  if (isMember) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <MemberTopBar />
        <main>{children}</main>
        <MemberBottomMenu />
      </div>
    );
  }

  // Belum login -> pakai navbar public
  return (
    <div className={cn('min-h-screen bg-background', highCruiser.variable)}>
      <PublicNavbar />
      <main className="pt-16">{children}</main>
      <ScrollToTopButton />
    </div>
  );
}
