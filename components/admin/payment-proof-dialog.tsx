// components/admin/payment-proof-dialog.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUpdatePaymentStatus, type ParticipantRow } from '@/hooks/use-admin-participants';

interface PaymentProofDialogProps {
  registration: ParticipantRow | null;
  onClose: () => void;
}

export function PaymentProofDialog({ registration, onClose }: PaymentProofDialogProps) {
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const updatePayment = useUpdatePaymentStatus();

  const handleClose = () => {
    setRejectReason('');
    setShowReject(false);
    onClose();
  };

  const submit = (status: 'VERIFIED' | 'REJECTED') => {
    if (!registration) return;

    updatePayment.mutate(
      {
        registrationId: registration.id,
        status,
        rejectReason: status === 'REJECTED' ? rejectReason : undefined,
      },
      {
        onSuccess: () => {
          toast.success(status === 'VERIFIED' ? 'Pembayaran diverifikasi' : 'Pembayaran ditolak');
          handleClose();
        },
        onError: (error) => toast.error(error.message),
      },
    );
  };

  return (
    <Dialog open={!!registration} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bukti Transfer</DialogTitle>
          <DialogDescription>
            {registration?.member.name} — Rp{registration?.amountPaid.toLocaleString('id-ID')}
          </DialogDescription>
        </DialogHeader>

        {registration?.proofUrl ? (
          <a href={registration.proofUrl} target="_blank" rel="noopener noreferrer">
            <div className="relative h-80 w-full overflow-hidden rounded-xl border border-border bg-muted">
              <Image src={registration.proofUrl} alt="Bukti transfer" fill className="object-contain" />
            </div>
          </a>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">Tidak ada bukti transfer</p>
        )}

        {registration?.paymentStatus === 'REJECTED' && registration.paymentRejectReason && <p className="text-sm text-destructive">Alasan ditolak: {registration.paymentRejectReason}</p>}

        {showReject && (
          <div className="space-y-2">
            <Label htmlFor="reject-reason">Alasan penolakan (opsional)</Label>
            <Input id="reject-reason" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Misal: nominal tidak sesuai" />
          </div>
        )}

        <DialogFooter>
          {showReject ? (
            <>
              <Button type="button" variant="outline" onClick={() => setShowReject(false)}>
                Kembali
              </Button>
              <Button type="button" variant="destructive" onClick={() => submit('REJECTED')} disabled={updatePayment.isPending}>
                {updatePayment.isPending ? <Loader2 size={16} className="animate-spin" /> : 'Tolak Pembayaran'}
              </Button>
            </>
          ) : (
            <>
              {registration?.paymentStatus !== 'REJECTED' && (
                <Button type="button" variant="outline" className="text-destructive hover:text-destructive" onClick={() => setShowReject(true)}>
                  Tolak
                </Button>
              )}
              {registration?.paymentStatus !== 'VERIFIED' && (
                <Button type="button" onClick={() => submit('VERIFIED')} disabled={updatePayment.isPending}>
                  {updatePayment.isPending ? <Loader2 size={16} className="animate-spin" /> : 'Verifikasi'}
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
