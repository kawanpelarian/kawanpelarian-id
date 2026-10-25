// lib/badges.ts

// Lencana kehadiran, dihitung dari jumlah event yang statusnya Hadir
// (CHECKED_IN). Sifatnya kumulatif: sekali didapat tidak pernah hilang.
// Mau ubah syarat atau nama lencana? Cukup edit array di bawah.

export interface Badge {
  key: 'PELARI_BARU' | 'MULAI_RUTIN' | 'SETIA' | 'VETERAN';
  name: string;
  min: number; // minimal jumlah hadir
  description: string;
}

export const BADGES: readonly Badge[] = [
  { key: 'PELARI_BARU', name: 'Pelari Baru', min: 1, description: 'Hadir di 1 event' },
  { key: 'MULAI_RUTIN', name: 'Mulai Rutin', min: 5, description: 'Hadir di 5 event' },
  { key: 'SETIA', name: 'Setia', min: 10, description: 'Hadir di 10 event' },
  { key: 'VETERAN', name: 'Veteran', min: 25, description: 'Hadir di 25 event' },
] as const;

export function getEarnedBadges(attendedCount: number): Badge[] {
  return BADGES.filter((badge) => attendedCount >= badge.min);
}

// Lencana tertinggi yang sudah didapat (dipakai buat ikon di daftar peserta)
export function getTopBadge(attendedCount: number): Badge | null {
  const earned = getEarnedBadges(attendedCount);
  return earned.length ? earned[earned.length - 1] : null;
}

export function getNextBadge(attendedCount: number): Badge | null {
  return BADGES.find((badge) => attendedCount < badge.min) ?? null;
}

// Lencana yang baru saja tercapai dari `previous` ke `current` (null kalau tidak ada)
export function getCrossedBadge(previous: number, current: number): Badge | null {
  const crossed = BADGES.filter((badge) => previous < badge.min && current >= badge.min);
  return crossed.length ? crossed[crossed.length - 1] : null;
}
