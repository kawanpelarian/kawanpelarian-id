// app/p/[code]/card/route.tsx
import { ImageResponse } from 'next/og';
import QRCode from 'qrcode';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getSharedProfile, getInitials, loadAvatarDataUri, loadGeistFonts, nameFontSize, shareUrl } from '@/lib/share-profile';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Font script tampak lebih kecil dari Geist di ukuran yang sama, naikkan/turunkan di sini
const TITLE_FONT_SCALE = 1.15;

const NAVY = '#162349';
const YELLOW = '#FBDC00';
const LIME = '#BCF046';

interface Params {
  params: Promise<{ code: string }>;
}

interface ImageAsset {
  src: string;
  ratio: number;
}

// Cache di memori: aset dibaca & dikecilkan sekali per instance server,
// bukan di setiap request (ini penyebab utama render lambat).
const assetCache = new Map<string, Promise<ImageAsset | null>>();

async function shrink(buf: Buffer, maxWidth: number): Promise<Buffer> {
  try {
    const sharp = (await import('sharp')).default;
    return await sharp(buf).resize({ width: maxWidth, withoutEnlargement: true }).png({ compressionLevel: 9 }).toBuffer();
  } catch {
    return buf;
  }
}

function loadPublicImage(name: string, maxWidth: number): Promise<ImageAsset | null> {
  const key = `${name}:${maxWidth}`;
  let hit = assetCache.get(key);
  if (!hit) {
    hit = readPublicImage(name, maxWidth);
    assetCache.set(key, hit);
  }
  return hit;
}

async function readPublicImage(name: string, maxWidth: number): Promise<ImageAsset | null> {
  const dir = join(process.cwd(), 'public/images');

  try {
    const small = await shrink(await readFile(join(dir, `${name}.png`)), maxWidth);
    return {
      src: `data:image/png;base64,${small.toString('base64')}`,
      ratio: small.readUInt32BE(16) / small.readUInt32BE(20),
    };
  } catch {}

  try {
    const svg = await readFile(join(dir, `${name}.svg`), 'utf8');
    const box = svg.match(/viewBox="[\d.\-]+[ ,]+[\d.\-]+[ ,]+([\d.]+)[ ,]+([\d.]+)"/);
    return {
      src: `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`,
      ratio: box ? Number(box[1]) / Number(box[2]) : 1,
    };
  } catch {
    return null;
  }
}

function seededRandom(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let state = h >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildPattern(seed: string, ratio: number, spacing: number) {
  const random = seededRandom(seed);
  const width = 1080;
  const height = 1920;
  const slant = (-35 * Math.PI) / 180;
  const cos = Math.cos(slant);
  const sin = Math.sin(slant);
  const items: { left: number; top: number; width: number; height: number; rotate: number; opacity: number }[] = [];

  for (let row = -22; row <= 22; row++) {
    for (let col = -22; col <= 22; col++) {
      const along = (col + (row % 2 ? 0.5 : 0)) * spacing;
      const across = row * spacing * 0.85;
      const x = width / 2 + along * cos - across * sin + (random() - 0.5) * 24;
      const y = height / 2 + along * sin + across * cos + (random() - 0.5) * 24;

      if (x < -60 || x > width + 60 || y < -60 || y > height + 60) continue;

      const size = 58 + random() * 24;
      items.push({
        width: Math.round(size),
        height: Math.round(size / ratio),
        left: Math.round(x - size / 2),
        top: Math.round(y - size / (2 * ratio)),
        rotate: Math.round(-35 + (random() - 0.5) * 16),
        opacity: Number((0.07 + random() * 0.05).toFixed(3)),
      });
    }
  }

  return items;
}

export async function GET(request: Request, { params }: Params) {
  const { code } = await params;
  const profile = await getSharedProfile(code);

  if (!profile) return new Response('Not found', { status: 404 });

  const url = shareUrl(code);
  const download = new URL(request.url).searchParams.get('download') === '1';

  const [avatar, logo, mark, qrSvg, fonts] = await Promise.all([
    loadAvatarDataUri(profile.avatarUrl, 640),
    loadPublicImage('logo-horizontal-light', 900),
    loadPublicImage('logo-light', 128),
    QRCode.toString(url, { type: 'svg', margin: 0, color: { dark: NAVY, light: '#ffffff' } }),
    loadGeistFonts(),
  ]);
  const qr = `data:image/svg+xml;base64,${Buffer.from(qrSvg).toString('base64')}`;
  const pattern = mark ? buildPattern(code, mark.ratio, 115) : [];
  const logoWidth = logo ? Math.min(780, Math.round(230 * logo.ratio)) : 0;
  const badgeLabel = profile.topBadge ? profile.topBadge.name.toUpperCase() : 'ANGGOTA BARU';
  const displayUrl = url.replace(/^https?:\/\//, '');

  const headers: Record<string, string> = {
    'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=60',
  };
  if (download) headers['Content-Disposition'] = 'attachment; filename="kartu-kawan-pelarian.png"';

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: NAVY,
        color: '#ffffff',
        fontFamily: 'Geist',
        position: 'relative',
      }}
    >
      {mark &&
        pattern.map((item, index) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={index}
            src={mark.src}
            width={item.width}
            height={item.height}
            alt=""
            style={{
              position: 'absolute',
              left: item.left,
              top: item.top,
              opacity: item.opacity,
              transform: `rotate(${item.rotate}deg)`,
            }}
          />
        ))}
      <div
        style={{
          width: 900,
          height: 1500,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo.src} width={logoWidth} height={Math.round(logoWidth / logo.ratio)} alt="Kawan Pelarian" />
          ) : (
            <div style={{ display: 'flex', fontSize: 40, fontWeight: 700, letterSpacing: 4 }}>KAWAN PELARIAN</div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              width: 420,
              height: 420,
              borderRadius: 20,
              overflow: 'hidden',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: YELLOW,
            }}
          >
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} width={420} height={420} alt="" style={{ objectFit: 'cover', borderRadius: 20 }} />
            ) : (
              <div style={{ display: 'flex', fontSize: 180, fontWeight: 700, color: NAVY }}>{getInitials(profile.publicName)}</div>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              columnGap: 22,
              maxWidth: 900,
              marginTop: 36,
              fontFamily: '"OldportScript", "Geist"',
              fontSize: nameFontSize(profile.publicName, 84 * TITLE_FONT_SCALE),
              fontWeight: 400,
              lineHeight: 1.1,
            }}
          >
            {profile.publicName.split(' ').map((word, index) => (
              <div key={index} style={{ display: 'flex' }}>
                {word}
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              marginTop: 24,
              padding: '14px 40px',
              borderRadius: 999,
              backgroundColor: YELLOW,
              color: NAVY,
              fontSize: 36,
              fontWeight: 700,
              letterSpacing: 2,
            }}
          >
            {badgeLabel}
          </div>

          <div style={{ display: 'flex', fontSize: 190, fontWeight: 700, color: LIME, marginTop: 40, lineHeight: 1 }}>{profile.attendedCount}</div>
          <div style={{ display: 'flex', fontSize: 38, letterSpacing: 3, opacity: 0.85 }}>KALI LARI BARENG</div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 36,
            backgroundColor: '#ffffff',
            borderRadius: 40,
            padding: 36,
            color: NAVY,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} width={220} height={220} alt="" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', fontSize: 50, fontWeight: 700 }}>Lihat profilku</div>
            <div style={{ display: 'flex', fontSize: 24 }}>{displayUrl}</div>
          </div>
        </div>
      </div>
    </div>,
    { width: 1080, height: 1920, headers, fonts },
  );
}
