import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface MemberListRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string | null;
  createdAt: string;
  _count: { registrations: number };
}

async function fetchMembers(search?: string): Promise<MemberListRow[]> {
  const params = new URLSearchParams();
  if (search) params.set('search', search);

  const res = await fetch(`/api/admin/members?${params.toString()}`);
  if (!res.ok) throw new Error('Gagal memuat data member');
  const data = await res.json();
  return data.members;
}

export function useAdminMembersList(search?: string) {
  return useQuery({
    queryKey: ['admin-members-list', search],
    queryFn: () => fetchMembers(search),
  });
}

export function useDeleteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/members/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Gagal menghapus member');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-members-list'] });
    },
  });
}

export function useUpdateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name, email, phone, birthDate }: { id: string; name: string; email: string; phone: string; birthDate?: string }) => {
      const res = await fetch(`/api/admin/members/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, birthDate }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Gagal memperbarui member');
      return data.member;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-members-list'] });
    },
  });
}
