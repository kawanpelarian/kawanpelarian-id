// lib/check-in-window.ts

// Jendela check-in sebuah event, semuanya dalam WIB (+07:00):
// - Buka  : 00:00 hari-H
// - Tutup : jam mulai + DEFAULT_CHECK_IN_GRACE_MINUTES (default), atau
//           `checkInUntil` kalau admin memperpanjang dari halaman admin event
//
// Contoh: event Minggu mulai 06:00, grace 120 menit -> check-in tutup Minggu 08:00.
// Admin klik "+1 jam" -> tutup 09:00.
//
// Dipakai bareng oleh API check-in (validasi) dan API daftar event member
// (menentukan tombol check-in tampil atau tidak), jadi keduanya selalu sama.

import { getEventDateTime } from '@/lib/get-event-datetime';

// Ubah angka ini kalau mau batas default yang lebih longgar / ketat
export const DEFAULT_CHECK_IN_GRACE_MINUTES = 120;

interface CheckInEventInput {
  eventDate: string | Date;
  eventTime: string;
  checkInUntil?: string | Date | null;
}

export function getDefaultCheckInClose(eventDate: string | Date, eventTime: string): Date {
  const start = getEventDateTime(eventDate, eventTime);
  return new Date(start.getTime() + DEFAULT_CHECK_IN_GRACE_MINUTES * 60 * 1000);
}

export function getCheckInWindow(event: CheckInEventInput): { opensAt: Date; closesAt: Date } {
  const day = new Date(event.eventDate).toISOString().split('T')[0]; // "YYYY-MM-DD"
  const opensAt = new Date(`${day}T00:00:00+07:00`);
  const defaultClose = getDefaultCheckInClose(event.eventDate, event.eventTime);

  // Perpanjangan tidak boleh memperpendek jendela default
  const extended = event.checkInUntil ? new Date(event.checkInUntil) : null;
  const closesAt = extended && extended > defaultClose ? extended : defaultClose;

  return { opensAt, closesAt };
}

export function isCheckInOpen(event: CheckInEventInput, now: Date = new Date()): boolean {
  const { opensAt, closesAt } = getCheckInWindow(event);
  return now >= opensAt && now <= closesAt;
}
