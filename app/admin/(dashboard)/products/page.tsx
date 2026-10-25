// app/admin/(dashboard)/products/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, ShoppingBag, Eye } from 'lucide-react';
import { useAdminProducts, useDeleteProduct } from '@/hooks/use-admin-products';
import { useClientPagination } from '@/hooks/use-client-pagination';
import { TablePagination } from '@/components/admin/table-pagination';
import { SortDropdown, type SortOption } from '@/components/admin/sort-dropdown';
import { sortData } from '@/lib/sort-data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function AdminProductsPage() {
  const { data: products, isLoading, isFetching, refetch } = useAdminProducts();
  const deleteProduct = useDeleteProduct();

  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const sortedProducts = sortData(products ?? [], sortOption, {
    dateField: 'createdAt',
    nameField: 'name',
  });

  const { page, pageSize, total, paginatedData: paginatedProducts, handlePageChange, handlePageSizeChange } = useClientPagination(sortedProducts);

  const handleConfirmDelete = () => {
    if (!deleteTargetId) return;

    deleteProduct.mutate(deleteTargetId, {
      onSuccess: () => {
        toast.success('Produk berhasil dihapus');
        setDeleteTargetId(null);
      },
      onError: (error) => {
        toast.error(error.message);
        setDeleteTargetId(null);
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-primaryBlack dark:text-primaryWhite">Kelola Produk</h1>
        <div className="flex items-center gap-2">
          <SortDropdown value={sortOption} onChange={setSortOption} />
          <Button render={<Link href="/admin/products/create" />} nativeButton={false}>
            <Plus size={16} />
            Produk Baru
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Gambar</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead>Stok Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-10 w-10 rounded-md" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-10" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-16" />
                  </TableCell>
                </TableRow>
              ))
            ) : paginatedProducts.length ? (
              paginatedProducts.map((product) => {
                const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);

                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="relative h-10 w-10 overflow-hidden rounded-md bg-muted">
                        {product.imageUrl ? (
                          <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <ShoppingBag size={14} className="text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-primaryBlack dark:text-primaryWhite">
                      <Link href={`/admin/products/${product.id}`} className="hover:underline">
                        {product.name}
                      </Link>
                    </TableCell>
                    <TableCell>Rp{product.price.toLocaleString('id-ID')}</TableCell>
                    <TableCell>
                      <span className={totalStock === 0 ? 'text-destructive' : ''}>{totalStock}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.isActive ? 'default' : 'secondary'}>{product.isActive ? 'Aktif' : 'Nonaktif'}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" render={<Link href={`/admin/products/${product.id}`} />} nativeButton={false}>
                          <Eye size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" render={<Link href={`/admin/products/${product.id}/edit`} />} nativeButton={false}>
                          <Pencil size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteTargetId(product.id)}>
                          <Trash2 size={14} className="text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Belum ada produk, yuk buat produk pertama!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination page={page} pageSize={pageSize} total={total} onPageChange={handlePageChange} onPageSizeChange={handlePageSizeChange} onRefresh={() => refetch()} isRefreshing={isFetching} />

      <AlertDialog open={!!deleteTargetId} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Produk?</AlertDialogTitle>
            <AlertDialogDescription>Tindakan ini gak bisa dibatalkan. Semua varian dan gambar produk ini juga ikut terhapus.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
