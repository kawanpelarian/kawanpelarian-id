// app/p/[code]/page.tsx
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { after } from 'next/server';
import { ExternalLink } from 'lucide-react';
import { auth } from '@/auth';
import { BADGES, getEarnedBadges } from '@/lib/badges';
import { SOCIALS } from '@/lib/social-links';
import { getSharedProfile, shareUrl } from '@/lib/share-profile';
import { isBot, recordProfileView } from '@/lib/profile-views';
import { MemberAvatar } from '@/components/member/member-avatar';
import { BadgeChip } from '@/components/member/attendance-badge';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const profile = await getSharedProfile(code);

  if (!profile) {
    return { title: 'Profil tidak ditemukan', robots: { index: false, follow: false } };
  }

  const title = `${profile.publicName} di Kawan Pelarian`;
  const description = profile.bio ? `${profile.attendedCount}x lari bareng · ${profile.bio}` : `${profile.attendedCount}x lari bareng Kawan Pelarian`;

  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: { title, description, url: shareUrl(code) },
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { code } = await params;
  const profile = await getSharedProfile(code);

  if (!profile) notFound();

  const session = await auth();
  const isOwner = session?.user.role === 'MEMBER' && session.user.id === profile.id;
  const requestHeaders = await headers();
  const userAgent = requestHeaders.get('user-agent');
  const ip = requestHeaders.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';

  if (!isOwner && !isBot(userAgent)) {
    after(() => recordProfileView(profile.id, ip, userAgent ?? ''));
  }

  const earned = getEarnedBadges(profile.attendedCount);
  const socials = SOCIALS.filter((social) => profile[social.key]);
  const joined = profile.createdAt.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-md space-y-8">
        <Link href="/" className="flex items-center justify-center gap-2">
          <Image src="/images/logo-horizontal-dark.png" alt="Kawan Pelarian" width={600} height={600} className="w-52" />
        </Link>

        <div className="flex flex-col items-center gap-4 text-center">
          <MemberAvatar name={profile.publicName} avatarUrl={profile.avatarUrl} size="lg" />
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-primaryBlack dark:text-primaryWhite">{profile.publicName}</h1>
            <p className="text-xs text-muted-foreground">Bergabung {joined}</p>
          </div>
          {profile.bio && <p className="text-sm text-foreground/80">{profile.bio}</p>}

          {socials.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {socials.map((social) => (
                <a
                  key={social.key}
                  href={social.href(profile[social.key] as string)}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm transition-colors hover:bg-accent"
                >
                  {social.label}
                  <ExternalLink size={12} />
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4 rounded-xl border border-border p-5">
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-4xl font-semibold text-primaryBlack dark:text-primaryWhite">{profile.attendedCount}</span>
            <span className="text-sm text-muted-foreground">kali lari bareng</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {BADGES.map((badge) => (
              <div key={badge.key} className="flex flex-col items-center gap-1.5 text-center">
                <BadgeChip badge={badge} earned={earned.some((e) => e.key === badge.key)} />
                <span className="text-[11px] text-muted-foreground">{badge.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 rounded-xl bg-brandNavy p-6 text-center text-white">
          <p className="text-lg font-semibold">Lari pelan, tetap punya kawan</p>
          <p className="text-sm text-white/80">Gabung Kawan Pelarian dan lari bareng setiap minggu di Medan.</p>
          <div className="flex justify-center gap-2 pt-1">
            <Link href="/register" className="rounded-lg bg-brandYellow px-4 py-2 text-sm font-semibold text-brandNavy">
              Gabung Sekarang
            </Link>
            <Link href="/events" className="rounded-lg border border-white/30 px-4 py-2 text-sm font-medium text-white">
              Lihat Event
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
