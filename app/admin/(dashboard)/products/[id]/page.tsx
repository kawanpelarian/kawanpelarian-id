// app/admin/(dashboard)/products/[id]/page.tsx
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { Pencil, Trash2, ShoppingBag } from 'lucide-react';
import { useAdminProduct, useDeleteProduct } from '@/hooks/use-admin-products';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: product, isLoading } = useAdminProduct(id);
  const deleteProduct = useDeleteProduct();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    deleteProduct.mutate(id, {
      onSuccess: () => {
        toast.success('Produk berhasil dihapus');
        router.push('/admin/products');
      },
      onError: (error) => toast.error(error.message),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.3fr]">
          <Skeleton className="aspect-square w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!product) {
    return <p className="text-muted-foreground">Produk tidak ditemukan</p>;
  }

  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
  const allImages = [...(product.imageUrl ? [product.imageUrl] : []), ...product.images.map((img) => img.url)];

  return (
    <div className="space-y-6 pb-24 lg:pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-primaryBlack dark:text-primaryWhite">{product.name}</h1>
        <div className="hidden items-center gap-2 lg:flex">
          <Button variant="outline" render={<Link href={`/admin/products/${id}/edit`} />} nativeButton={false}>
            <Pencil size={14} />
            Edit
          </Button>
          <Button variant="outline" onClick={() => setShowDeleteConfirm(true)}>
            <Trash2 size={14} className="text-destructive" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.3fr] lg:items-start">
        {/* Kolom Kiri: Gambar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Gambar Produk</CardTitle>
            </CardHeader>
            <CardContent>
              {allImages.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {allImages.map((url, i) => (
                    <div key={url} className="relative aspect-square overflow-hidden rounded-lg border border-border">
                      <Image src={url} alt={`${product.name} ${i + 1}`} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex aspect-square w-full items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground">
                  <ShoppingBag size={28} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Kolom Kanan: Info & Varian */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detail Produk</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Harga</span>
                <span className="font-semibold">Rp{product.price.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={product.isActive ? 'default' : 'secondary'}>{product.isActive ? 'Aktif' : 'Nonaktif'}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Stok</span>
                <span className={totalStock === 0 ? 'text-destructive' : ''}>{totalStock}</span>
              </div>
              {product.description && <p className="whitespace-pre-line break-words border-t border-border pt-3 text-sm text-muted-foreground">{product.description}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Varian &amp; Stok</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Ukuran</TableHead>
                    <TableHead>Stok</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {product.variants.map((variant) => (
                    <TableRow key={variant.id}>
                      <TableCell className="pl-6">{variant.size}</TableCell>
                      <TableCell className={variant.stock === 0 ? 'text-destructive' : ''}>{variant.stock}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Aksi sticky di mobile, sama pola kayak halaman lain */}
      <div className="fixed inset-x-0 bottom-0 z-20 flex gap-2 border-t border-border bg-background p-4 lg:hidden">
        <Button variant="outline" className="flex-1" render={<Link href={`/admin/products/${id}/edit`} />} nativeButton={false}>
          <Pencil size={14} />
          Edit
        </Button>
        <Button variant="outline" onClick={() => setShowDeleteConfirm(true)}>
          <Trash2 size={14} className="text-destructive" />
        </Button>
      </div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Produk?</AlertDialogTitle>
            <AlertDialogDescription>Tindakan ini gak bisa dibatalkan. Semua varian dan gambar produk ini juga ikut terhapus.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
