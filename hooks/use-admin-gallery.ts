import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { compressImage } from '@/lib/compress-image';

export interface Photo {
  id: string;
  url: string;
  createdAt: string;
}

export interface Album {
  id: string;
  name: string;
  coverPhotoUrl: string | null;
  driveLink: string | null;
  photos: Photo[];
}

async function fetchAlbum(eventId: string): Promise<Album | null> {
  const res = await fetch(`/api/admin/events/${eventId}/album`);
  if (!res.ok) throw new Error('Gagal memuat album');
  const data = await res.json();
  return data.album;
}

export function useAlbum(eventId: string) {
  return useQuery({
    queryKey: ['admin-album', eventId],
    queryFn: () => fetchAlbum(eventId),
    enabled: !!eventId,
  });
}

export function useSaveAlbum(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, driveLink }: { name: string; driveLink: string }) => {
      const res = await fetch(`/api/admin/events/${eventId}/album`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, driveLink }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Gagal menyimpan album');
      return data.album;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-album', eventId] });
    },
  });
}

export function useUploadPhoto(albumId: string, eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const compressed = await compressImage(file);

      const formData = new FormData();
      formData.append('file', compressed);

      const res = await fetch(`/api/admin/albums/${albumId}/photos`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Gagal mengupload foto');
      return data.photo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-album', eventId] });
    },
  });
}

export function useDeletePhoto(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (photoId: string) => {
      const res = await fetch(`/api/admin/photos/${photoId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Gagal menghapus foto');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-album', eventId] });
    },
  });
}

export function useSetCoverPhoto(albumId: string, eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (photoUrl: string) => {
      const res = await fetch(`/api/admin/albums/${albumId}/cover`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoUrl }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Gagal mengatur cover');
      return data.album;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-album', eventId] });
    },
  });
}
