import { useQuery } from '@tanstack/react-query';

export interface GalleryAlbum {
  id: string;
  name: string;
  coverPhotoUrl: string | null;
  driveLink: string | null;
  event: { name: string; slug: string; eventDate: string };
  _count: { photos: number };
}

export interface GalleryAlbumDetail {
  id: string;
  name: string;
  coverPhotoUrl: string | null;
  driveLink: string | null;
  event: { name: string; slug: string; eventDate: string };
  photos: { id: string; url: string }[];
}

async function fetchGalleries(): Promise<GalleryAlbum[]> {
  const res = await fetch('/api/gallery');
  if (!res.ok) throw new Error('Gagal memuat galeri');
  const data = await res.json();
  return data.albums;
}

export function useGalleries() {
  return useQuery({
    queryKey: ['public-gallery'],
    queryFn: fetchGalleries,
  });
}

async function fetchAlbumDetail(albumId: string): Promise<GalleryAlbumDetail> {
  const res = await fetch(`/api/gallery/${albumId}`);
  if (!res.ok) throw new Error('Gagal memuat detail album');
  const data = await res.json();
  return data.album;
}

export function useGalleryAlbumDetail(albumId: string | null) {
  return useQuery({
    queryKey: ['public-gallery', albumId],
    queryFn: () => fetchAlbumDetail(albumId as string),
    enabled: !!albumId,
  });
}
