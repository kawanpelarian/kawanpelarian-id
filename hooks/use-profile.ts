import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UpdateProfileInput, ChangePasswordInput } from '@/schemas/profile.schema';

export interface MemberProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  birthDate: string | null;
  createdAt: string;
  hasPassword: boolean;
}

async function fetchProfile(): Promise<MemberProfile> {
  const res = await fetch('/api/profile');
  if (!res.ok) throw new Error('Gagal memuat profile');
  const data = await res.json();
  return data.member;
}

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateProfileInput) => {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Gagal memperbarui profile');
      return data.member;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (input: ChangePasswordInput) => {
      const res = await fetch('/api/profile/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Gagal mengganti password');
      return data;
    },
  });
}
