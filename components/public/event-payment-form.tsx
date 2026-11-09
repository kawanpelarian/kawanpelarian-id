// components/public/event-payment-form.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Copy, ImagePlus, Loader2, X } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface EventPaymentFormProps {
  price: number;
  isPending: boolean;
  submitLabel: string;
  onSubmit: (proof: File) => void;
}

const MAX_FILE_SIZE = 8 * 1024 * 1024;

export function EventPaymentForm({ price, isPending, submitLabel, onSubmit }: EventPaymentFormProps) {
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(siteConfig.bankAccount.accountNumber);
    toast.success('Nomor rekening disalin');
  };

  const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Bukti transfer harus berupa gambar');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('Ukuran bukti transfer maksimal 8MB');
      return;
    }

    setProofFile(file);
    setProofPreview(URL.createObjectURL(file));
  };

  const clearProof = () => {
    if (proofPreview) URL.revokeObjectURL(proofPreview);
    setProofFile(null);
    setProofPreview(null);
  };

  const handleSubmit = () => {
    if (!proofFile) {
      toast.error('Upload bukti transfer dulu ya');
      return;
    }

    onSubmit(proofFile);
  };

  return (
    <div className="space-y-4 rounded-xl border border-border p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Total pembayaran</span>
        <span className="text-lg font-bold text-primaryBlack dark:text-primaryWhite">Rp{price.toLocaleString('id-ID')}</span>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-lg bg-muted p-3 text-sm">
        <div>
          <p className="font-medium">
            {siteConfig.bankAccount.bankName} — {siteConfig.bankAccount.accountNumber}
          </p>
          <p className="text-muted-foreground">a.n. {siteConfig.bankAccount.accountHolder}</p>
        </div>
        <Button type="button" variant="outline" size="icon" onClick={handleCopyAccount}>
          <Copy size={14} />
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="event-proof">Bukti Transfer</Label>

        {proofPreview ? (
          <div className="relative h-48 w-full overflow-hidden rounded-xl border border-border">
            <Image src={proofPreview} alt="Preview bukti transfer" fill unoptimized className="object-contain" />
            <Button type="button" variant="secondary" size="icon" className="absolute right-2 top-2" onClick={clearProof}>
              <X size={16} />
            </Button>
          </div>
        ) : (
          <label htmlFor="event-proof" className="flex h-40 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border text-muted-foreground transition-colors hover:bg-accent">
            <ImagePlus size={24} />
            <span className="text-sm">Klik untuk upload bukti transfer</span>
            <span className="text-xs">JPG/PNG, maksimal 8MB</span>
            <input id="event-proof" type="file" accept="image/*" onChange={handleProofChange} className="hidden" />
          </label>
        )}
      </div>

      <Button type="button" size="lg" className="w-full" onClick={handleSubmit} disabled={isPending}>
        {isPending ? <Loader2 size={16} className="animate-spin" /> : submitLabel}
      </Button>
    </div>
  );
}
