// app/(member)/members/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMembers } from '@/hooks/use-members';
import { toTitleCase } from '@/lib/format-name';
import { getTopBadge } from '@/lib/badges';
import { MemberAvatar } from '@/components/member/member-avatar';
import { BadgeChip } from '@/components/member/attendance-badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function MembersPage() {
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useMembers(search, page);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(input.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [input]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-primaryBlack dark:text-primaryWhite">Member</h1>
        <p className="text-[15px] text-muted-foreground">Kenalan dengan sesama Kawan Pelarian.</p>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Cari nama member" className="pl-9" />
      </div>

      <div className="space-y-2">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)
        ) : isError ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Gagal memuat daftar member.</p>
        ) : data && data.members.length > 0 ? (
          data.members.map((member) => {
            const name = toTitleCase(member.name);
            const badge = getTopBadge(member.attendedCount);
            return (
              <Link key={member.id} href={`/members/${member.id}`} className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-accent">
                <MemberAvatar name={name} avatarUrl={member.avatarUrl} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-primaryBlack dark:text-primaryWhite">{name}</p>
                  <p className="text-xs text-muted-foreground">{member.attendedCount}x lari bareng</p>
                </div>
                {badge && <BadgeChip badge={badge} size="sm" />}
              </Link>
            );
          })
        ) : (
          <p className="py-10 text-center text-sm text-muted-foreground">Member tidak ditemukan.</p>
        )}
      </div>

      {data && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft size={14} />
            Sebelumnya
          </Button>
          <span className="text-xs text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Berikutnya
            <ChevronRight size={14} />
          </Button>
        </div>
      )}
    </div>
  );
}
