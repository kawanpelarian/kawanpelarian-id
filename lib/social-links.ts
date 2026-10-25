const STRAVA_HOSTS = ['strava.com', 'www.strava.com', 'strava.app.link'];

export const INSTAGRAM_PATTERN = /^[A-Za-z0-9._]{1,30}$/;
export const TIKTOK_PATTERN = /^[A-Za-z0-9._]{1,24}$/;

export function normalizeStravaUrl(input: string): string | null {
  const raw = input.trim();
  if (!raw) return '';
  if (raw.length > 200) return null;

  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    const host = url.hostname.toLowerCase();
    if (!STRAVA_HOSTS.includes(host)) return null;
    if (host === 'strava.app.link' ? url.pathname.length < 2 : !/^\/(athletes|pros)\/[^/]+/.test(url.pathname)) {
      return null;
    }
    url.protocol = 'https:';
    url.hash = '';
    return url.toString();
  } catch {
    return null;
  }
}

export const SOCIALS = [
  {
    key: 'instagram',
    label: 'Instagram',
    placeholder: 'username',
    href: (value: string) => `https://www.instagram.com/${value}`,
  },
  {
    key: 'strava',
    label: 'Link Strava',
    placeholder: 'Tempel link profil Strava kamu',
    href: (value: string) => value,
  },
  {
    key: 'tiktok',
    label: 'TikTok',
    placeholder: 'username',
    href: (value: string) => `https://www.tiktok.com/@${value}`,
  },
] as const;

export type SocialKey = (typeof SOCIALS)[number]['key'];
