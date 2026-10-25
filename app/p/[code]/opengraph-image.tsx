// app/p/[code]/opengraph-image.tsx
import { ImageResponse } from 'next/og';
import { getSharedProfile, getInitials, loadAvatarDataUri, loadGeistFonts, nameFontSize } from '@/lib/share-profile';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Profil Kawan Pelarian';

const NAVY = '#162349';
const YELLOW = '#FBDC00';
const LIME = '#BCF046';

export default async function OgImage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const profile = await getSharedProfile(code);

  if (!profile) {
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
          fontSize: 56,
          fontWeight: 700,
        }}
      >
        Kawan Pelarian
      </div>,
      { ...size },
    );
  }

  const [avatar, fonts] = await Promise.all([loadAvatarDataUri(profile.avatarUrl, 360), loadGeistFonts()]);

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 64,
        backgroundColor: NAVY,
        padding: '0 90px',
        color: '#ffffff',
        fontFamily: 'Geist',
      }}
    >
      <div
        style={{
          display: 'flex',
          width: 360,
          height: 360,
          borderRadius: 180,
          border: `10px solid ${LIME}`,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: YELLOW,
          flexShrink: 0,
        }}
      >
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} width={360} height={360} alt="" style={{ objectFit: 'cover' }} />
        ) : (
          <div style={{ display: 'flex', fontSize: 140, fontWeight: 700, color: NAVY }}>{getInitials(profile.publicName)}</div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', fontSize: 30, letterSpacing: 4, color: YELLOW, fontWeight: 700 }}>KAWAN PELARIAN</div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            columnGap: 18,
            maxWidth: 640,
            fontSize: nameFontSize(profile.publicName, 72),
            fontWeight: 700,
            lineHeight: 1.1,
          }}
        >
          {profile.publicName.split(' ').map((word, index) => (
            <div key={index} style={{ display: 'flex' }}>
              {word}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
          <div style={{ display: 'flex', fontSize: 110, fontWeight: 700, color: LIME }}>{profile.attendedCount}</div>
          <div style={{ display: 'flex', fontSize: 36, opacity: 0.85 }}>kali lari bareng</div>
        </div>
        {profile.topBadge && (
          <div
            style={{
              display: 'flex',
              alignSelf: 'flex-start',
              padding: '10px 30px',
              borderRadius: 999,
              backgroundColor: YELLOW,
              color: NAVY,
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            {profile.topBadge.name.toUpperCase()}
          </div>
        )}
      </div>
    </div>,
    { ...size, fonts },
  );
}
