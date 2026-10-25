// components/member/attendance-badge.tsx
import { Footprints, Flame, Medal, Crown, type LucideIcon } from 'lucide-react';
import { getTopBadge, type Badge } from '@/lib/badges';
import { cn } from '@/lib/utils';

export const badgeVisual: Record<Badge['key'], { icon: LucideIcon; className: string }> = {
  PELARI_BARU: {
    icon: Footprints,
    className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  },
  MULAI_RUTIN: {
    icon: Flame,
    className: 'bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400',
  },
  SETIA: {
    icon: Medal,
    className: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
  },
  VETERAN: {
    icon: Crown,
    className: 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
  },
};

interface BadgeChipProps {
  badge: Badge;
  earned?: boolean;
  size?: 'sm' | 'md';
}

// Satu lencana berbentuk bulat. earned=false dipakai buat lencana yang belum didapat (pudar)
export function BadgeChip({ badge, earned = true, size = 'md' }: BadgeChipProps) {
  const { icon: Icon, className } = badgeVisual[badge.key];
  const dimension = size === 'sm' ? 'h-5 w-5' : 'h-11 w-11';
  const iconSize = size === 'sm' ? 12 : 20;

  return (
    <span title={`${badge.name} · ${badge.description}`} className={cn('inline-flex shrink-0 items-center justify-center rounded-full', dimension, earned ? className : 'bg-muted text-muted-foreground opacity-40')}>
      <Icon size={iconSize} />
    </span>
  );
}

// Ikon kecil lencana tertinggi, buat ditaruh di sebelah nama di daftar peserta
export function AttendanceBadgeIcon({ attendedCount }: { attendedCount: number }) {
  const badge = getTopBadge(attendedCount);
  if (!badge) return null;

  return (
    <span title={`${badge.name} · ${attendedCount}x hadir`} className="ml-2 inline-flex align-middle">
      <BadgeChip badge={badge} size="sm" />
    </span>
  );
}
