import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { QuickCreateMemberInput } from '@/schemas/admin-member.schema';

export interface MemberSearchResult {
  id: string;
  name: string;
  email: string;
  phone: string;
}

async function searchMembers(query: string): Promise<MemberSearchResult[]> {
  if (query.trim().length < 2) return [];

  const res = await fetch(`/api/admin/members/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Gagal mencari member');
  const data = await res.json();
  return data.members;
}

export function useSearchMembers(query: string) {
  return useQuery({
    queryKey: ['admin-members-search', query],
    queryFn: () => searchMembers(query),
    enabled: query.trim().length >= 2,
  });
}

export function useQuickCreateMember() {
  return useMutation({
    mutationFn: async (input: QuickCreateMemberInput): Promise<MemberSearchResult> => {
      const res = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Gagal membuat member');
      return data.member;
    },
  });
}

export function useManualRegisterMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, memberId }: { eventId: string; memberId: string }) => {
      const res = await fetch('/api/admin/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, memberId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Gagal mendaftarkan peserta');
      return data.registration;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-participants'] });
    },
  });
}
