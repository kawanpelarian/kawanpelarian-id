'use client';

import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TablePaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

const PAGE_SIZE_OPTIONS = [20, 50, 100];

export function TablePagination({ page, pageSize, total, onPageChange, onPageSizeChange, onRefresh, isRefreshing }: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">{total === 0 ? 'Gak ada data' : `${startItem}-${endItem} dari ${total}`}</span>

        <select value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))} className="h-8 rounded-md border border-input bg-background px-2 text-sm shadow-sm">
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size} / halaman
            </option>
          ))}
        </select>

        <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={onRefresh} disabled={isRefreshing} title="Refresh data">
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
          <ChevronLeft size={14} />
        </Button>
        <span className="text-sm text-muted-foreground">
          Halaman {page} / {totalPages}
        </span>
        <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
          <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
}
