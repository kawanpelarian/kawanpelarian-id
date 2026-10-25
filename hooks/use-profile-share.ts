// hooks/use-profile-share.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface ProfileShareState {
  isSharingEnabled: boolean;
  shareCode: string | null;
  shareUrl: string | null;
  views: number;
  viewsLast7Days: number;
}

export function useProfileShare() {
  return useQuery({
    queryKey: ['profile-share'],
    queryFn: async (): Promise<ProfileShareState> => {
      const res = await fetch('/api/profile/share');
      if (!res.ok) throw new Error('Gagal memuat pengaturan bagikan profil');
      return res.json();
    },
  });
}

export function useUpdateProfileShare() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (action: 'enable' | 'disable' | 'regenerate') => {
      const res = await fetch('/api/profile/share', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Gagal memperbarui link profil');
      return data as ProfileShareState;
    },
    onSuccess: (data) => queryClient.setQueryData(['profile-share'], data),
  });
}
