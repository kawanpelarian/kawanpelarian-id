import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { compressImage } from '@/lib/compress-image';
import type { PublicProfileInput } from '@/schemas/public-profile.schema';

export interface PublicProfileSettings {
  bio: string | null;
  avatarUrl: string | null;
  instagram: string | null;
  strava: string | null;
  tiktok: string | null;
  isProfileHidden: boolean;
}

export function usePublicProfileSettings() {
  return useQuery({
    queryKey: ['public-profile'],
    queryFn: async (): Promise<PublicProfileSettings> => {
      const res = await fetch('/api/profile/public');
      if (!res.ok) throw new Error('Gagal memuat profil publik');
      return (await res.json()).profile;
    },
  });
}

function useInvalidateProfiles() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['public-profile'] });
    queryClient.invalidateQueries({ queryKey: ['members'] });
    queryClient.invalidateQueries({ queryKey: ['member'] });
  };
}

export function useSavePublicProfile() {
  const invalidate = useInvalidateProfiles();

  return useMutation({
    mutationFn: async (input: PublicProfileInput) => {
      const res = await fetch('/api/profile/public', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Gagal menyimpan profil publik');
      return data.profile as PublicProfileSettings;
    },
    onSuccess: invalidate,
  });
}

export function useUploadAvatar() {
  const invalidate = useInvalidateProfiles();

  return useMutation({
    mutationFn: async (file: File) => {
      const compressed = await compressImage(file);
      const formData = new FormData();
      formData.append('file', compressed);

      const res = await fetch('/api/profile/avatar', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Gagal mengunggah foto');
      return data.avatarUrl as string;
    },
    onSuccess: invalidate,
  });
}

export function useRemoveAvatar() {
  const invalidate = useInvalidateProfiles();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/profile/avatar', { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Gagal menghapus foto');
    },
    onSuccess: invalidate,
  });
}
