// app/(member)/members/[id]/page.tsx
'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ExternalLink, EyeOff } from 'lucide-react';
import { useMemberProfile } from '@/hooks/use-members';
import { toTitleCase } from '@/lib/format-name';
import { BADGES, getEarnedBadges, getTopBadge } from '@/lib/badges';
import { SOCIALS } from '@/lib/social-links';
import { MemberAvatar } from '@/components/member/member-avatar';
import { BadgeChip } from '@/components/member/attendance-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function MemberProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useMemberProfile(id);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-md space-y-6 px-4 py-6">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-md space-y-4 px-4 py-16 text-center">
        <p className="text-sm text-muted-foreground">Profil tidak ditemukan atau disembunyikan oleh pemiliknya.</p>
        <Button variant="outline" render={<Link href="/members" />} nativeButton={false}>
          Kembali ke daftar member
        </Button>
      </div>
    );
  }

  const { member, events } = data;
  const name = toTitleCase(member.name);
  const earned = getEarnedBadges(member.attendedCount);
  const topBadge = getTopBadge(member.attendedCount);
  const socials = SOCIALS.filter((social) => member[social.key]);
  const joined = new Date(member.createdAt).toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-6">
      <Link href="/members" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={14} />
        Semua member
      </Link>

      {member.isSelf && member.isProfileHidden && (
        <div className="flex items-start gap-3 rounded-xl border border-border bg-muted p-3">
          <EyeOff size={16} className="mt-0.5 shrink-0 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Profilmu sedang disembunyikan. Hanya kamu yang bisa melihat halaman ini.</p>
        </div>
      )}

      <div className="flex flex-col items-center gap-3 text-center">
        <MemberAvatar name={name} avatarUrl={member.avatarUrl} size="lg" />
        <div className="space-y-1">
          <h1 className="flex items-center justify-center gap-2 text-2xl font-semibold text-primaryBlack dark:text-primaryWhite">
            {name}
            {topBadge && <BadgeChip badge={topBadge} size="sm" />}
          </h1>
          <p className="text-xs text-muted-foreground">Bergabung {joined}</p>
        </div>
        {member.bio && <p className="text-sm text-foreground/80">{member.bio}</p>}

        {socials.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {socials.map((social) => (
              <Button key={social.key} variant="outline" size="sm" render={<a href={social.href(member[social.key] as string)} target="_blank" rel="noopener noreferrer nofollow" />} nativeButton={false}>
                {social.label}
                <ExternalLink size={12} />
              </Button>
            ))}
          </div>
        )}

        {member.isSelf && (
          <Button variant="ghost" size="sm" render={<Link href="/profile" />} nativeButton={false}>
            Edit profil
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lencana</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-primaryBlack dark:text-primaryWhite">{member.attendedCount}</span>
            <span className="text-sm text-muted-foreground">kali lari bareng</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {BADGES.map((badge) => (
              <div key={badge.key} className="flex flex-col items-center gap-1.5 text-center">
                <BadgeChip badge={badge} earned={earned.some((e) => e.key === badge.key)} />
                <span className="text-xs text-muted-foreground">{badge.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Event yang Dihadiri</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length > 0 ? (
            <ul className="divide-y divide-border">
              {events.map((event) => (
                <li key={event.id}>
                  <Link href={`/events/${event.slug}`} className="flex items-center justify-between gap-3 py-2.5 text-sm hover:underline">
                    <span className="truncate">{event.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {new Date(event.eventDate).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Belum ada event yang dihadiri.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
