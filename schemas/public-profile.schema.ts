import { z } from 'zod';
import { INSTAGRAM_PATTERN, TIKTOK_PATTERN, normalizeStravaUrl } from '@/lib/social-links';

export const STRAVA_ERROR = 'Link Strava tidak valid. Tempel link profil dari strava.com/athletes/... atau link share dari aplikasi Strava';

const handleField = (pattern: RegExp, label: string) =>
  z
    .string()
    .trim()
    .transform((value) => value.replace(/^@/, ''))
    .refine((value) => value === '' || pattern.test(value), `Username ${label} tidak valid`);

export const publicProfileSchema = z.object({
  bio: z
    .string()
    .trim()
    .max(160, 'Bio maksimal 160 karakter')
    .transform((value) => value.replace(/\s+/g, ' ')),
  instagram: handleField(INSTAGRAM_PATTERN, 'Instagram'),
  strava: z
    .string()
    .trim()
    .refine((value) => normalizeStravaUrl(value) !== null, STRAVA_ERROR)
    .transform((value) => normalizeStravaUrl(value) ?? ''),
  tiktok: handleField(TIKTOK_PATTERN, 'TikTok'),
  isProfileHidden: z.boolean(),
});

export type PublicProfileInput = z.input<typeof publicProfileSchema>;
