export function isSameDay(dateA: Date, dateB: Date): boolean {
  const format = (date: Date) => date.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });

  return format(dateA) === format(dateB);
}
