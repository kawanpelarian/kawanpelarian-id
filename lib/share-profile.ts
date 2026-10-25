// lib/share-profile.ts
import { cache } from 'react';
import { randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { prisma } from '@/lib/prisma';
import { siteConfig } from '@/lib/site-config';
import { getTopBadge } from '@/lib/badges';
import { toTitleCase } from '@/lib/format-name';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export function generateShareCode(length = 10) {
  return Array.from(randomBytes(length), (byte) => ALPHABET[byte % ALPHABET.length]).join('');
}

export const shareUrl = (code: string) => `${siteConfig.url}/p/${code}`;

export function toPublicName(name: string) {
  return toTitleCase(name).trim().replace(/\s+/g, ' ') || 'Member';
}

export function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

export function toJpgUrl(url: string, size: number) {
  return url.includes('/upload/') ? url.replace('/upload/', `/upload/f_jpg,w_${size},h_${size},c_fill/`) : url;
}

export async function loadAvatarDataUri(url: string | null, size = 400) {
  if (!url) return null;

  try {
    const target = new URL(toJpgUrl(url, size));
    if (target.hostname !== 'res.cloudinary.com') return null;

    const res = await fetch(target, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;

    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length > 1_500_000) return null;

    return `data:image/jpeg;base64,${buffer.toString('base64')}`;
  } catch {
    return null;
  }
}

export const getSharedProfile = cache(async (code: string) => {
  if (!/^[A-Za-z0-9]{6,20}$/.test(code)) return null;

  const member = await prisma.member.findFirst({
    where: { shareCode: code, isSharingEnabled: true },
    select: {
      id: true,
      name: true,
      bio: true,
      avatarUrl: true,
      instagram: true,
      strava: true,
      tiktok: true,
      createdAt: true,
    },
  });

  if (!member) return null;

  const attendedCount = await prisma.registration.count({
    where: { memberId: member.id, status: 'CHECKED_IN' },
  });

  return {
    ...member,
    publicName: toPublicName(member.name),
    attendedCount,
    topBadge: getTopBadge(attendedCount),
  };
});

let fontCache: Promise<any> | null = null;
export async function loadGeistFonts() {
  const fonts = await (fontCache ??= readGeistFonts());
  if (!fonts) fontCache = null; // jangan cache kegagalan
  return fonts;
}

async function readGeistFonts() {
  try {
    const dir = join(process.cwd(), 'assets/fonts');
    const [regular, bold] = await Promise.all([readFile(join(dir, 'Geist-Regular.ttf')), readFile(join(dir, 'Geist-Bold.ttf'))]);
    return [
      { name: 'Geist', data: regular, weight: 400 as const, style: 'normal' as const },
      { name: 'Geist', data: bold, weight: 700 as const, style: 'normal' as const },
    ];
  } catch {
    return undefined;
  }
}

export function nameFontSize(name: string, base: number) {
  if (name.length <= 14) return base;
  if (name.length <= 22) return Math.round(base * 0.84);
  return Math.round(base * 0.7);
}
