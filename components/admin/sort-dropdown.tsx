'use client';

import { ArrowDownAZ, ArrowUpAZ, ArrowDownWideNarrow, ArrowUpWideNarrow, ListFilter } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export type SortOption = 'newest' | 'oldest' | 'az' | 'za';

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  // Kalau tabelnya gak punya kolom nama yang relevan buat A-Z (jarang, tapi jaga-jaga)
  hideAlphabetical?: boolean;
}

const sortLabels: Record<SortOption, string> = {
  newest: 'Terbaru',
  oldest: 'Terlama',
  az: 'A - Z',
  za: 'Z - A',
};

export function SortDropdown({ value, onChange, hideAlphabetical }: SortDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm">
            <ListFilter size={14} />
            {sortLabels[value]}
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onChange('newest')}>
          <ArrowDownWideNarrow size={14} />
          Terbaru
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChange('oldest')}>
          <ArrowUpWideNarrow size={14} />
          Terlama
        </DropdownMenuItem>
        {!hideAlphabetical && (
          <>
            <DropdownMenuItem onClick={() => onChange('az')}>
              <ArrowDownAZ size={14} />A - Z
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onChange('za')}>
              <ArrowUpAZ size={14} />Z - A
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
