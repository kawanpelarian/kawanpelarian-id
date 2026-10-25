// components/public/gallery-client.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Images, Download, FolderUp } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useGalleries, useGalleryAlbumDetail } from '@/hooks/use-public-gallery';
import { EventPageChrome } from '@/components/shared/event-page-chrome';
import { CopyLinkButton } from '@/components/shared/copy-link-button';
import { siteConfig } from '@/lib/site-config';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

export function GalleryClient() {
  const { data: albums, isLoading } = useGalleries();
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Kalau ada ?album=xxx di URL (misal dari link yang di-copy), langsung buka dialog itu
  useEffect(() => {
    const albumFromUrl = searchParams.get('album');
    if (albumFromUrl) setSelectedAlbumId(albumFromUrl);
  }, [searchParams]);

  const handleOpenAlbum = (albumId: string) => {
    setSelectedAlbumId(albumId);
    router.replace(`/gallery?album=${albumId}`, { scroll: false });
  };

  const handleCloseAlbum = () => {
    setSelectedAlbumId(null);
    router.replace('/gallery', { scroll: false });
  };

  const handleDownloadPhoto = async (url: string) => {
    try {
      // Fetch dulu jadi blob, bukan langsung pakai <a download> ke URL Cloudinary,
      // karena attribute `download` gak kepaksa jalan buat resource cross-origin
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'kawan-pelarian-' + Date.now() + '.webp';
      link.click();

      URL.revokeObjectURL(blobUrl);
    } catch {
      toast.error('Gagal mendownload foto, coba lagi');
    }
  };
  const { data: albumDetail, isLoading: isDetailLoading } = useGalleryAlbumDetail(selectedAlbumId);

  return (
    <EventPageChrome>
      <div className="mx-auto max-w-5xl space-y-8 px-6 py-10 lg:px-8">
        <div className="space-y-1 text-center">
          <h1 className="font-title text-3xl font-black uppercase italic text-primaryBlack dark:text-primaryWhite">Galeri</h1>
          <p className="text-[15px] text-muted-foreground">Dokumentasi seluruh event Kawan Pelarian</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full rounded-xl" />
            ))}
          </div>
        ) : albums && albums.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {albums.map((album) => (
              <button key={album.id} type="button" onClick={() => handleOpenAlbum(album.id)} className="group relative aspect-square overflow-hidden rounded-xl border border-border">
                {album.coverPhotoUrl ? <Image src={album.coverPhotoUrl} alt={album.name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" /> : <div className="h-full w-full bg-muted" />}

                <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 to-transparent p-3">
                  <p className="truncate text-left text-sm font-medium text-white">{album.name}</p>
                  <p className="text-left text-xs text-white/80">{album._count.photos} foto</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
            <Images size={28} />
            <p className="text-sm">Belum ada dokumentasi yang diupload</p>
          </div>
        )}
      </div>

      {/* Dialog lightbox: semua foto dalam album yang dipilih */}
      <Dialog open={!!selectedAlbumId} onOpenChange={(open) => !open && handleCloseAlbum()}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <div className="space-y-2 pr-6">
            <DialogTitle>{albumDetail?.name ?? 'Memuat album...'}</DialogTitle>
            <div className="flex flex-wrap gap-2">
              {selectedAlbumId && <CopyLinkButton url={`${siteConfig.url}/gallery?album=${selectedAlbumId}`} variant="outline" label="Salin Link Album" className="h-8 text-xs" />}
              {albumDetail?.driveLink && (
                <Button type="button" variant="outline" className="h-8 rounded-full text-xs" render={<a href={albumDetail.driveLink} target="_blank" rel="noopener noreferrer" />} nativeButton={false}>
                  <FolderUp size={14} />
                  Lihat Semua di Google Drive
                </Button>
              )}
            </div>
          </div>

          {isDetailLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square w-full rounded-lg" />
              ))}
            </div>
          ) : albumDetail && albumDetail.photos.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {albumDetail.photos.map((photo) => (
                <div key={photo.id} className="relative aspect-square overflow-hidden rounded-lg border border-border">
                  <Image src={photo.url} alt="Foto galeri" fill className="object-cover" />

                  <button
                    type="button"
                    onClick={() => handleDownloadPhoto(photo.url)}
                    aria-label="Download foto"
                    className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
                  >
                    <Download size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">Belum ada foto di album ini</p>
          )}
        </DialogContent>
      </Dialog>
    </EventPageChrome>
  );
}
