// lib/check-in-window.ts
import { getEventDateTime } from '@/lib/get-event-datetime';

export const CHECK_IN_OPEN_MINUTES_BEFORE_START = 30;
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
  const start = getEventDateTime(event.eventDate, event.eventTime);
  const opensAt = new Date(start.getTime() - CHECK_IN_OPEN_MINUTES_BEFORE_START * 60 * 1000);
  const defaultClose = getDefaultCheckInClose(event.eventDate, event.eventTime);

  const extended = event.checkInUntil ? new Date(event.checkInUntil) : null;
  const closesAt = extended && extended > defaultClose ? extended : defaultClose;

  return { opensAt, closesAt };
}

export function isCheckInOpen(event: CheckInEventInput, now: Date = new Date()): boolean {
  const { opensAt, closesAt } = getCheckInWindow(event);
  return now >= opensAt && now <= closesAt;
}