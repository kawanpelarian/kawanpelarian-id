// app/admin/(dashboard)/orders/page.tsx
'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Package, Eye, Download, Loader2, Rocket } from 'lucide-react';
import { useAdminOrders } from '@/hooks/use-admin-orders';
import { useStoreStatus, useSetOrdersOpen, useStartNewBatch } from '@/hooks/use-store-status';
import { Switch } from '@/components/ui/switch';
import { useClientPagination } from '@/hooks/use-client-pagination';
import { TablePagination } from '@/components/admin/table-pagination';
import { SortDropdown, type SortOption } from '@/components/admin/sort-dropdown';
import { sortData } from '@/lib/sort-data';
import { exportOrdersToExcel, exportOrdersToPDF, exportSizeRecapToPDF, exportSizeRecapToWord } from '@/lib/export-orders';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

const statusOptions = [
  { value: '', label: 'Semua Status' },
  { value: 'PENDING', label: 'Menunggu Verifikasi' },
  { value: 'VERIFIED', label: 'Terverifikasi' },
  { value: 'REJECTED', label: 'Ditolak' },
];

const statusLabel = {
  PENDING: 'Menunggu Verifikasi',
  VERIFIED: 'Terverifikasi',
  REJECTED: 'Ditolak',
} as const;

const statusVariant = {
  PENDING: 'secondary',
  VERIFIED: 'default',
  REJECTED: 'destructive',
} as const;

function AdminOrdersContent() {
  const searchParams = useSearchParams();
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') ?? '');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [isExporting, setIsExporting] = useState(false);
  const { data: storeStatus, isLoading: isLoadingStatus } = useStoreStatus();
  const setOrdersOpen = useSetOrdersOpen();
  const startNewBatch = useStartNewBatch();
  const ordersOpen = storeStatus?.ordersOpen ?? true;
  const currentBatch = storeStatus?.currentBatch ?? 1;

  // null = ikut batch aktif; "all" = semua batch; angka = batch tertentu
  const [batchFilter, setBatchFilter] = useState<string | null>(null);
  const [showNewBatchConfirm, setShowNewBatchConfirm] = useState(false);
  const selectedBatch = batchFilter === 'all' ? undefined : Number(batchFilter ?? currentBatch);
  const batchLabel = selectedBatch ? `Batch ${selectedBatch}` : undefined;

  const handleStartNewBatch = () => {
    startNewBatch.mutate(undefined, {
      onSuccess: (data) => {
        toast.success(data.message);
        setBatchFilter(null);
        setShowNewBatchConfirm(false);
      },
      onError: (error) => toast.error(error.message),
    });
  };

  const handleToggleOrders = (open: boolean) => {
    setOrdersOpen.mutate(open, {
      onSuccess: () => toast.success(open ? 'Pre-order dibuka' : 'Pre-order ditutup'),
      onError: (error) => toast.error(error.message),
    });
  };

  // Tunggu batch aktif ke-load dulu, biar fetch pertama langsung ke batch yang benar
  const { data: orders, isLoading: isLoadingOrders, isFetching, refetch } = useAdminOrders(statusFilter || undefined, selectedBatch, !!storeStatus);
  const isLoading = isLoadingOrders || isLoadingStatus;

  const sortedOrders = sortData(orders ?? [], sortOption, {
    dateField: 'createdAt',
    nameField: (order) => order.member.name,
  });

  const { page, pageSize, total, paginatedData: paginatedOrders, handlePageChange, handlePageSizeChange } = useClientPagination(sortedOrders);

  const totalPemesanUnik = new Set(sortedOrders.map((o) => o.member.id)).size;
  const totalPendapatan = sortedOrders.filter((o) => o.status !== 'REJECTED').reduce((sum, o) => sum + o.totalAmount, 0);

  const handleExport = async (type: 'excel' | 'pdf' | 'pdf-recap' | 'word-recap') => {
    if (!sortedOrders.length) {
      toast.error('Gak ada data buat diekspor');
      return;
    }

    setIsExporting(true);
    try {
      if (type === 'excel') {
        await exportOrdersToExcel(sortedOrders, batchLabel);
      } else if (type === 'pdf') {
        await exportOrdersToPDF(sortedOrders, batchLabel);
      } else if (type === 'pdf-recap') {
        await exportSizeRecapToPDF(sortedOrders, batchLabel);
      } else {
        await exportSizeRecapToWord(sortedOrders, batchLabel);
      }
      toast.success('Rekap berhasil diunduh');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Gagal export data');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-primaryBlack dark:text-primaryWhite">Kelola Pesanan</h1>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="sm" disabled={isExporting}>
                {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                Export ke...
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExport('excel')}>Excel (.xlsx)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('pdf')}>PDF</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('pdf-recap')}>PDF Rekap Konveksi</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('word-recap')}>Word Rekap Konveksi (.docx)</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border p-4">
        <div>
          <p className="text-sm font-medium text-primaryBlack dark:text-primaryWhite">
            Pre-order Batch {currentBatch} {ordersOpen ? 'Dibuka' : 'Ditutup'}
          </p>
          <p className="text-xs text-muted-foreground">{ordersOpen ? 'Member bisa checkout. Matikan kalau batch ini udah cukup.' : 'Checkout dikunci. Mulai batch baru kalau mau buka pre-order lagi.'}</p>
        </div>

        <div className="flex items-center gap-3">
          {!ordersOpen && (
            <Button size="sm" variant="outline" onClick={() => setShowNewBatchConfirm(true)} disabled={isLoadingStatus || startNewBatch.isPending}>
              <Rocket size={14} />
              Mulai Batch {currentBatch + 1}
            </Button>
          )}
          <Switch checked={ordersOpen} onCheckedChange={handleToggleOrders} disabled={isLoadingStatus || setOrdersOpen.isPending} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm sm:w-56">
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select value={batchFilter ?? String(currentBatch)} onChange={(e) => setBatchFilter(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm sm:w-40">
          <option value="all">Semua Batch</option>
          {Array.from({ length: currentBatch }, (_, i) => currentBatch - i).map((b) => (
            <option key={b} value={String(b)}>
              Batch {b}
              {b === currentBatch ? ' (aktif)' : ''}
            </option>
          ))}
        </select>

        <SortDropdown value={sortOption} onChange={setSortOption} />

        <span className="ml-auto text-sm text-muted-foreground">
          <strong className="text-primaryBlack dark:text-primaryWhite">{sortedOrders.length}</strong> pesanan
          {' · '}
          <strong className="text-primaryBlack dark:text-primaryWhite">{totalPemesanUnik}</strong> orang
          {' · '}
          <strong className="text-primaryBlack dark:text-primaryWhite">Rp{totalPendapatan.toLocaleString('id-ID')}</strong>
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pemesan</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-5 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8" />
                  </TableCell>
                </TableRow>
              ))
            ) : paginatedOrders.length ? (
              paginatedOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium text-primaryBlack dark:text-primaryWhite">{order.member.name}</TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-muted-foreground">{order.items.map((item) => `${item.variant.product.name} (${item.variant.size}) x${item.quantity}`).join(', ')}</TableCell>
                  <TableCell>Rp{order.totalAmount.toLocaleString('id-ID')}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                    {' · '}B{order.batch}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[order.status]}>{statusLabel[order.status]}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" render={<Link href={`/admin/orders/${order.id}`} />} nativeButton={false}>
                      <Eye size={14} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Package size={24} />
                    Belum ada pesanan
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={showNewBatchConfirm} onOpenChange={setShowNewBatchConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mulai Batch {currentBatch + 1}?</AlertDialogTitle>
            <AlertDialogDescription>
              Pre-order langsung dibuka lagi dan pesanan baru masuk ke Batch {currentBatch + 1}. Pesanan Batch {currentBatch} tetap tersimpan dan bisa difilter atau diexport sendiri. Stok per ukuran tidak berubah, atur dulu lewat edit
              produk kalau perlu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleStartNewBatch} disabled={startNewBatch.isPending}>
              Mulai Batch {currentBatch + 1}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <TablePagination page={page} pageSize={pageSize} total={total} onPageChange={handlePageChange} onPageSizeChange={handlePageSizeChange} onRefresh={() => refetch()} isRefreshing={isFetching} />
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={null}>
      <AdminOrdersContent />
    </Suspense>
  );
}
