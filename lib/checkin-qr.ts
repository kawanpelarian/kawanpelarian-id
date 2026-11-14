// lib/checkin-qr.ts
import { createHmac, timingSafeEqual } from 'crypto';

const PURPOSE = 'checkin-qr:v1';

function sign(registrationId: string): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET belum diset');

  return createHmac('sha256', secret).update(`${PURPOSE}:${registrationId}`).digest('base64url').slice(0, 22);
}

export function createCheckInToken(registrationId: string): string {
  return `${registrationId}.${sign(registrationId)}`;
}

export function verifyCheckInToken(token: string): string | null {
  const separator = token.lastIndexOf('.');
  if (separator <= 0) return null;

  const registrationId = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  const expected = sign(registrationId);

  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  return registrationId;
}
