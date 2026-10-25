import { getEventDateTime } from '@/lib/get-event-datetime';

interface IcsEventInput {
  id: string;
  name: string;
  description: string;
  eventDate: string | Date;
  eventTime: string;
  meetingPoint: string;
}

const EVENT_DURATION_MS = 2 * 60 * 60 * 1000; // asumsi durasi 2 jam

function formatIcsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

// Karakter tertentu (koma, titik koma, dst) wajib di-escape sesuai spek iCalendar
function escapeIcsText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

export function generateEventIcs(event: IcsEventInput): string {
  const start = getEventDateTime(event.eventDate, event.eventTime);
  const end = new Date(start.getTime() + EVENT_DURATION_MS);
  const now = new Date();

  // Deskripsi dari Tiptap masih HTML, strip dulu tag-nya
  const plainDescription = event.description
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // iCalendar wajib CRLF (\r\n) sebagai line ending, bukan \n biasa
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Kawan Pelarian//Event//ID',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id}@kawanpelarian.my.id`,
    `DTSTAMP:${formatIcsDate(now)}`,
    `DTSTART:${formatIcsDate(start)}`,
    `DTEND:${formatIcsDate(end)}`,
    `SUMMARY:${escapeIcsText(event.name)}`,
    `LOCATION:${escapeIcsText(event.meetingPoint)}`,
    `DESCRIPTION:${escapeIcsText(plainDescription)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return lines.join('\r\n');
}
