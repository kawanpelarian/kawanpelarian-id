// lib/sort-data.ts
import type { SortOption } from '@/components/admin/sort-dropdown';

type FieldAccessor<T> = keyof T | ((item: T) => string | number | Date);

interface SortDataOptions<T> {
  dateField: FieldAccessor<T>;
  nameField: FieldAccessor<T>;
}

function getValue<T>(item: T, accessor: FieldAccessor<T>): string | number | Date {
  if (typeof accessor === 'function') return accessor(item);
  return item[accessor] as string | number | Date;
}

export function sortData<T>(data: T[], sortOption: SortOption, { dateField, nameField }: SortDataOptions<T>): T[] {
  const sorted = [...data];

  switch (sortOption) {
    case 'newest':
      return sorted.sort((a, b) => new Date(getValue(b, dateField)).getTime() - new Date(getValue(a, dateField)).getTime());
    case 'oldest':
      return sorted.sort((a, b) => new Date(getValue(a, dateField)).getTime() - new Date(getValue(b, dateField)).getTime());
    case 'az':
      return sorted.sort((a, b) => String(getValue(a, nameField)).localeCompare(String(getValue(b, nameField)), 'id'));
    case 'za':
      return sorted.sort((a, b) => String(getValue(b, nameField)).localeCompare(String(getValue(a, nameField)), 'id'));
    default:
      return sorted;
  }
}
