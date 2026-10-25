// app/admin/(dashboard)/orders/[id]/page.tsx
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { Check, X, Loader2, Mail, Phone, Pencil } from 'lucide-react';
import { useAdminOrder, useUpdateOrderStatus } from '@/hooks/use-admin-orders';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

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

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useAdminOrder(id);
  const updateStatus = useUpdateOrderStatus();

  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleApprove = () => {
    updateStatus.mutate(
      { id, status: 'VERIFIED' },
      {
        onSuccess: () => toast.success('Pesanan diverifikasi, email udah dikirim ke member'),
        onError: (error) => toast.error(error.message),
      },
    );
  };

  const handleReject = () => {
    updateStatus.mutate(
      { id, status: 'REJECTED', rejectReason: rejectReason || undefined },
      {
        onSuccess: () => {
          toast.success('Pesanan ditolak, stok dikembalikan otomatis');
          setShowRejectDialog(false);
          setRejectReason('');
        },
        onError: (error) => toast.error(error.message),
      },
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-lg space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!order) {
    return <p className="text-muted-foreground">Pesanan tidak ditemukan</p>;
  }

  return (
    <div className="space-y-6 pb-24 lg:pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-primaryBlack dark:text-primaryWhite">Pesanan #{order.id.slice(-8).toUpperCase()}</h1>
        <div className="flex items-center gap-2">
          <Badge variant={statusVariant[order.status]}>{statusLabel[order.status]}</Badge>
          {order.status !== 'REJECTED' && (
            <Button variant="outline" size="sm" render={<Link href={`/admin/orders/${order.id}/edit`} />} nativeButton={false}>
              <Pencil size={13} />
              Edit Item
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.3fr] lg:items-start">
        {/* Kolom Kiri: Pemesan & Bukti Transfer */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pemesan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 text-sm">
              <p className="font-medium text-primaryBlack dark:text-primaryWhite">{order.member.name}</p>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Mail size={13} />
                {order.member.email}
              </div>
              {order.member.phone && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Phone size={13} />
                  {order.member.phone}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bukti Transfer</CardTitle>
            </CardHeader>
            <CardContent>
              {order.proofUrl ? (
                <a href={order.proofUrl} target="_blank" rel="noopener noreferrer">
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border">
                    <Image src={order.proofUrl} alt="Bukti transfer" fill className="object-contain" />
                  </div>
                </a>
              ) : (
                <p className="text-sm text-muted-foreground">Gak ada bukti transfer</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Kolom Kanan: Item, Catatan, Aksi */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Item Pesanan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {item.variant.product.imageUrl && <Image src={item.variant.product.imageUrl} alt={item.variant.product.name} fill className="object-cover" />}
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-medium text-primaryBlack dark:text-primaryWhite">{item.variant.product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.variant.size} x{item.quantity}
                    </p>
                  </div>
                  <span className="text-sm">Rp{(item.price * item.quantity).toLocaleString('id-ID')}</span>
                </div>
              ))}

              <div className="flex items-center justify-between border-t border-border pt-3 text-sm font-semibold">
                <span>Total</span>
                <span>Rp{order.totalAmount.toLocaleString('id-ID')}</span>
              </div>
            </CardContent>
          </Card>

          {order.note && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Catatan Member</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{order.note}</p>
              </CardContent>
            </Card>
          )}

          {order.status === 'PENDING' && (
            <div className="hidden gap-2 lg:flex">
              <Button type="button" className="flex-1" onClick={handleApprove} disabled={updateStatus.isPending}>
                {updateStatus.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <Check size={16} />
                    Verifikasi
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" className="flex-1 text-destructive hover:text-destructive" onClick={() => setShowRejectDialog(true)} disabled={updateStatus.isPending}>
                <X size={16} />
                Tolak
              </Button>
            </div>
          )}

          {order.status === 'VERIFIED' && (
            <Button type="button" variant="outline" className="hidden w-full text-destructive hover:text-destructive lg:flex" onClick={() => setShowRejectDialog(true)} disabled={updateStatus.isPending}>
              <X size={16} />
              Batalkan Verifikasi
            </Button>
          )}
        </div>
      </div>

      {/* Aksi sticky di mobile, sama pola kayak form produk */}
      {order.status === 'PENDING' && (
        <div className="fixed inset-x-0 bottom-0 z-20 flex gap-2 border-t border-border bg-background p-4 lg:hidden">
          <Button type="button" className="flex-1" onClick={handleApprove} disabled={updateStatus.isPending}>
            {updateStatus.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <Check size={16} />
                Verifikasi
              </>
            )}
          </Button>
          <Button type="button" variant="outline" className="flex-1 text-destructive hover:text-destructive" onClick={() => setShowRejectDialog(true)} disabled={updateStatus.isPending}>
            <X size={16} />
            Tolak
          </Button>
        </div>
      )}

      {order.status === 'VERIFIED' && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background p-4 lg:hidden">
          <Button type="button" variant="outline" className="w-full text-destructive hover:text-destructive" onClick={() => setShowRejectDialog(true)} disabled={updateStatus.isPending}>
            <X size={16} />
            Batalkan Verifikasi
          </Button>
        </div>
      )}

      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tolak Pesanan?</AlertDialogTitle>
            <AlertDialogDescription>Stok bakal dikembaliin otomatis, dan member dapet email pemberitahuan. Kasih alasan biar member ngerti (opsional).</AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Misal: bukti transfer gak sesuai jumlah, dll" />
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleReject}>Tolak Pesanan</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
