'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePublicStats } from '@/hooks/use-public-stats';

export function HeroSection() {
  const [imageError, setImageError] = useState(false);
  const { data: stats, isLoading } = usePublicStats();

  return (
    <section id="hero" className="relative -mt-16 flex h-screen min-h-150 w-full items-center justify-center overflow-hidden">
      {/* Background foto, fallback abu-abu kalau belum ada/gagal dimuat */}
      {imageError ? <div className="absolute inset-0 bg-neutral-400" /> : <Image src="/images/hero-section-v2.png" alt="Kawan Pelarian lari bareng" fill priority className="object-cover" onError={() => setImageError(true)} />}

      {/* Konten */}
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 text-center">
        <h1 className="font-title italic text-3xl md:text-4xl font-black uppercase leading-tight text-white sm:text-5xl lg:text-7xl">Lari Pelan Tetap Punya Kawan</h1>

        <p className="max-w-xl text-base text-white/85 sm:text-lg">Komunitas lari santai buat semua kalangan, tanpa fokus kecepatan atau kompetisi. Yuk gabung dan rasain serunya lari bareng tiap minggu di Medan.</p>

        <Button size="lg" className="rounded-full bg-white px-10 text-primaryBlack hover:bg-white/90" render={<Link href="/events" />} nativeButton={false}>
          Lari Bareng Kami
        </Button>

        {/* Counter member, social proof biar calon member yakin komunitas ini aktif */}
        <div className="flex items-center gap-2 text-sm text-white/80">
          <Users size={16} />
          {isLoading ? (
            <span>Memuat data komunitas...</span>
          ) : (
            <span>
              Sudah <span className="font-bold text-white">{stats?.totalMembers ?? 0}</span> kawan yang gabung
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
