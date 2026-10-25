// components/admin/stat-card.tsx
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  isLoading?: boolean;
  href?: string;
  highlight?: boolean; // kasih aksen warna, buat nunjukkin "perlu perhatian"
}

export function StatCard({ label, value, icon: Icon, isLoading, href, highlight }: StatCardProps) {
  const content = (
    <Card className={highlight ? 'border-amber-300 dark:border-amber-800' : 'border-border'}>
      <CardContent className="flex items-center justify-between px-6 py-5">
        <div className="space-y-1">
          <p className="text-[15px] text-muted-foreground">{label}</p>
          {isLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-3xl font-semibold text-primaryBlack dark:text-primaryWhite">{value}</p>}
        </div>
        <div className={highlight ? 'flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/50' : 'flex h-11 w-11 items-center justify-center rounded-full bg-muted'}>
          <Icon size={20} className={highlight ? 'text-amber-600 dark:text-amber-500' : 'text-primaryBlack dark:text-primaryWhite'} />
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block transition-opacity hover:opacity-80">
        {content}
      </Link>
    );
  }

  return content;
}
