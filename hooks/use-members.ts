import { keepPreviousData, useQuery } from '@tanstack/react-query';

export interface MemberListItem {
  id: string;
  name: string;
  avatarUrl: string | null;
  attendedCount: number;
}

export interface MemberListResponse {
  members: MemberListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface MemberProfileDetail {
  id: string;
  name: string;
  bio: string | null;
  avatarUrl: string | null;
  instagram: string | null;
  strava: string | null;
  tiktok: string | null;
  isProfileHidden: boolean;
  createdAt: string;
  attendedCount: number;
  isSelf: boolean;
}

export interface MemberAttendedEvent {
  id: string;
  name: string;
  slug: string;
  eventDate: string;
}

export function useMembers(search: string, page: number) {
  return useQuery({
    queryKey: ['members', search, page],
    queryFn: async (): Promise<MemberListResponse> => {
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.set('search', search);
      const res = await fetch(`/api/members?${params}`);
      if (!res.ok) throw new Error('Gagal memuat daftar member');
      return res.json();
    },
    placeholderData: keepPreviousData,
  });
}

export function useMemberProfile(id: string) {
  return useQuery({
    queryKey: ['member', id],
    queryFn: async (): Promise<{ member: MemberProfileDetail; events: MemberAttendedEvent[] }> => {
      const res = await fetch(`/api/members/${id}`);
      if (!res.ok) throw new Error('Profil tidak ditemukan');
      return res.json();
    },
    enabled: !!id,
    retry: false,
  });
}
