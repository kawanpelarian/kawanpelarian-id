'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarCheck2, History, UserRound } from 'lucide-react';
import { Logo } from '@/components/logo';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const navItems = [
  { title: 'Event Saya', url: '/my-events', icon: CalendarCheck2 },
  { title: 'Riwayat', url: '/attendance', icon: History },
  { title: 'Profil', url: '/profile', icon: UserRound },
];

export function MemberBottomNav() {
  const pathname = usePathname();

  return (
    <TooltipProvider delay={100}>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background">
        <div className="mx-auto flex max-w-md items-center justify-between px-6 py-3">
          <Link href="/">
            <Logo width={36} height={36} />
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.url;
              return (
                <Tooltip key={item.url}>
                  <TooltipTrigger
                    render={
                      <Link
                        href={item.url}
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-full transition-colors',
                          isActive ? 'bg-primaryBlack text-primaryWhite dark:bg-primaryWhite dark:text-primaryBlack' : 'text-muted-foreground hover:bg-accent',
                        )}
                      />
                    }
                  >
                    <item.icon size={20} />
                  </TooltipTrigger>
                  <TooltipContent side="top">{item.title}</TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </div>
      </nav>
    </TooltipProvider>
  );
}
