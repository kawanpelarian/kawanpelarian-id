// app/opengraph-image.tsx
import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Kawan Pelarian';

export default async function OgImage() {
  const logoBuffer = await readFile(join(process.cwd(), 'public/images/logo-dark.png'));
  const logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;

  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        gap: 32,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logoBase64} width={320} height={90} alt="Kawan Pelarian" />

      <div
        style={{
          fontSize: 40,
          fontWeight: 900,
          fontStyle: 'italic',
          textTransform: 'uppercase',
          color: '#162349',
          letterSpacing: -1,
        }}
      >
        Lari Pelan Tetap Punya Kawan
      </div>

      <div style={{ width: 120, height: 8, borderRadius: 4, backgroundColor: '#fbdc00' }} />
    </div>,
    { ...size },
  );
}
