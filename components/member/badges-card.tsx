// components/member/badges-card.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BADGES, getEarnedBadges, getNextBadge } from '@/lib/badges';
import { BadgeChip } from '@/components/member/attendance-badge';
import { useMyBadges } from '@/hooks/use-my-badges';

export function BadgesCard() {
  const { data, isLoading } = useMyBadges();

  if (isLoading) {
    return <Skeleton className="h-40 w-full rounded-xl" />;
  }

  const attendedCount = data?.attendedCount ?? 0;
  const earned = getEarnedBadges(attendedCount);
  const next = getNextBadge(attendedCount);

  const progress = next ? Math.min(100, Math.round((attendedCount / next.min) * 100)) : 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Lencana Saya</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-semibold text-primaryBlack dark:text-primaryWhite">{attendedCount}</span>
          <span className="text-sm text-muted-foreground">kali lari bareng</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {BADGES.map((badge) => {
            const isEarned = earned.some((e) => e.key === badge.key);
            return (
              <div key={badge.key} className="flex flex-col items-center gap-1.5 text-center">
                <BadgeChip badge={badge} earned={isEarned} />
                <span className={isEarned ? 'text-xs font-medium text-primaryBlack dark:text-primaryWhite' : 'text-xs text-muted-foreground'}>{badge.name}</span>
                <span className="text-[11px] text-muted-foreground">{badge.min}x</span>
              </div>
            );
          })}
        </div>

        <div className="space-y-2">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primaryBlack transition-all dark:bg-brandLime" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-muted-foreground">{next ? `${next.min - attendedCount} kali lagi untuk lencana ${next.name}` : 'Kamu sudah mengumpulkan semua lencana. Mantap!'}</p>
        </div>
      </CardContent>
    </Card>
  );
}
