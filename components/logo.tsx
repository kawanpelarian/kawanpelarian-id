'use client';

import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export function Logo({ width = 140, height = 40, className }: LogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hindari mismatch hydration: render placeholder kosong sampai mounted
  if (!mounted) {
    return <div style={{ width, height }} className={className} />;
  }

  // Light mode pakai logo-dark (kontras di atas background putih)
  // Dark mode pakai logo-light (kontras di atas background hitam)
  const logoSrc = resolvedTheme === 'dark' ? '/images/logo-light.png' : '/images/logo-dark.png';

  return <Image src={logoSrc} alt="Kawan Pelarian" width={width} height={height} className={className} priority />;
}
