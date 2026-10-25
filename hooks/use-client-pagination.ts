import { useMemo, useState } from 'react';

export function useClientPagination<T>(data: T[] | undefined, defaultPageSize = 20) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const total = data?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Kalau data berubah (misal abis search) dan halaman sekarang jadi gak valid, balik ke 1
  const safePage = Math.min(page, totalPages);

  const paginatedData = useMemo(() => {
    if (!data) return [];
    const start = (safePage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, safePage, pageSize]);

  const handlePageChange = (newPage: number) => {
    setPage(Math.max(1, Math.min(newPage, totalPages)));
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  return {
    page: safePage,
    pageSize,
    total,
    paginatedData,
    handlePageChange,
    handlePageSizeChange,
    resetPage: () => setPage(1),
  };
}
