// lib/profile-views.ts
import { createHash } from 'node:crypto';
import { prisma } from '@/lib/prisma';

const BOT_PATTERN = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegram|instagram|twitter|linkedin|discord|slack|preview|fetch|curl|wget|python|axios|headless|lighthouse|monitor/i;

export function isBot(userAgent: string | null) {
  return !userAgent || BOT_PATTERN.test(userAgent);
}

function todayWib() {
  return new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export async function recordProfileView(memberId: string, ip: string, userAgent: string) {
  const day = todayWib();
  const viewerHash = createHash('sha256')
    .update(`${ip}|${userAgent}|${day}|${process.env.AUTH_SECRET ?? ''}`)
    .digest('hex')
    .slice(0, 32);

  try {
    await prisma.profileView.createMany({
      data: [{ memberId, viewerHash, day }],
      skipDuplicates: true,
    });
  } catch (error) {
    console.error('Record profile view error:', error);
  }
}
