export function getEventDateTime(eventDate: string | Date, eventTime: string): Date {
  const dateObj = new Date(eventDate);
  const isoDatePart = dateObj.toISOString().split('T')[0]; // "YYYY-MM-DD"

  return new Date(`${isoDatePart}T${eventTime}:00+07:00`);
}

export function isEventUpcoming(eventDate: string | Date, eventTime: string): boolean {
  return getEventDateTime(eventDate, eventTime) >= new Date();
}
