'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Images, ArrowRight } from 'lucide-react';
import { useGalleries } from '@/hooks/use-public-gallery';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function GallerySection() {
  const { data: albums, isLoading } = useGalleries();

  // API udah ordering desc by event.eventDate, ambil 3 album terbaru buat preview
  const latestAlbums = albums?.slice(0, 3);

  return (
    <section id="gallery-preview" className="mx-auto max-w-5xl px-6 py-20 lg:px-8">
      <div className="mb-10 text-center">
        <h2 className="font-title text-3xl font-black uppercase italic text-primaryBlack dark:text-primaryWhite sm:text-4xl">Dokumentasi Terbaru</h2>
        <p className="mt-2 text-[15px] text-muted-foreground">Momen-momen seru dari event Kawan Pelarian</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-xl" />
          ))}
        </div>
      ) : latestAlbums && latestAlbums.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {latestAlbums.map((album) => (
            <Link key={album.id} href="/gallery" className="group relative aspect-square overflow-hidden rounded-xl border border-border">
              {album.coverPhotoUrl ? <Image src={album.coverPhotoUrl} alt={album.name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" /> : <div className="h-full w-full bg-muted" />}

              <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100" />

              <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 to-transparent p-4">
                <p className="truncate text-sm font-medium text-white">{album.name}</p>
                <p className="text-xs text-white/80">{album._count.photos} foto</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
          <Images size={28} />
          <p className="text-sm">Belum ada dokumentasi yang diupload</p>
        </div>
      )}

      <div className="mt-8 text-center">
        <Button variant="ghost" render={<Link href="/gallery" />} nativeButton={false} className="rounded-full">
          Lihat Semua Galeri
          <ArrowRight size={16} />
        </Button>
      </div>
    </section>
  );
}
