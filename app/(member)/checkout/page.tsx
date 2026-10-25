// app/(member)/checkout/page.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Trash2, Loader2, Copy, ImagePlus, X } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useCheckout } from '@/hooks/use-products';
import { useStoreStatus } from '@/hooks/use-store-status';
import { PreorderClosedBanner } from '@/components/public/preorder-closed-banner';
import { siteConfig } from '@/lib/site-config';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, clear } = useCartStore();
  const checkout = useCheckout();
  const { data: storeStatus } = useStoreStatus();
  const ordersClosed = storeStatus?.ordersOpen === false;

  const [note, setNote] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofFile(file);
    setProofPreview(URL.createObjectURL(file));
    e.target.value = '';
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(siteConfig.bankAccount.accountNumber);
    toast.success('Nomor rekening disalin');
  };

  const handleSubmit = () => {
    if (ordersClosed) {
      toast.error('Pre-order batch ini sudah ditutup');
      return;
    }

    if (items.length === 0) {
      toast.error('Keranjang kosong');
      return;
    }

    if (!proofFile) {
      toast.error('Upload bukti transfer dulu');
      return;
    }

    checkout.mutate(
      {
        items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
        note: note || undefined,
        proof: proofFile,
      },
      {
        onSuccess: () => {
          toast.success('Pesanan berhasil dibuat, tunggu verifikasi dari admin ya!');
          clear();
          router.push('/my-orders');
        },
        onError: (error) => toast.error(error.message),
      },
    );
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg space-y-4 px-6 py-16 text-center">
        <p className="text-muted-foreground">Keranjang kamu kosong</p>
        <Button render={<a href="/merchandise" />} nativeButton={false}>
          Lihat Merchandise
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-8 px-6 py-10">
      <h1 className="font-title text-2xl font-black uppercase italic text-primaryBlack dark:text-primaryWhite">Checkout</h1>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.variantId} className="flex items-center gap-3 rounded-xl border border-border p-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">{item.imageUrl && <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" />}</div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium text-primaryBlack dark:text-primaryWhite">{item.productName}</p>
              <p className="text-xs text-muted-foreground">Ukuran {item.size}</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={item.maxStock}
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.variantId, Math.max(1, Math.min(item.maxStock, Number(e.target.value))))}
                  className="h-7 w-14 rounded-md border border-input bg-background px-2 text-sm"
                />
                <span className="text-xs text-muted-foreground">Rp{(item.price * item.quantity).toLocaleString('id-ID')}</span>
              </div>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(item.variantId)}>
              <Trash2 size={14} className="text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-border pt-4 text-sm font-semibold">
        <span>Total</span>
        <span>Rp{total.toLocaleString('id-ID')}</span>
      </div>

      <div className="space-y-2 rounded-xl border border-border bg-muted/40 p-4">
        <p className="text-sm font-medium text-primaryBlack dark:text-primaryWhite">Transfer ke rekening ini:</p>
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <p>
              {siteConfig.bankAccount.bankName} — {siteConfig.bankAccount.accountNumber}
            </p>
            <p className="text-muted-foreground">a.n. {siteConfig.bankAccount.accountHolder}</p>
          </div>
          <Button type="button" variant="outline" size="icon" onClick={handleCopyAccount}>
            <Copy size={14} />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="proof">Bukti Transfer</Label>

        {proofPreview ? (
          <div className="relative h-48 w-full overflow-hidden rounded-xl border border-border">
            <Image src={proofPreview} alt="Preview bukti transfer" fill className="object-contain" />
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute right-2 top-2"
              onClick={() => {
                setProofFile(null);
                setProofPreview(null);
              }}
            >
              <X size={16} />
            </Button>
          </div>
        ) : (
          <label htmlFor="proof" className="flex h-48 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border text-muted-foreground transition-colors hover:bg-accent">
            <ImagePlus size={24} />
            <span className="text-sm">Klik untuk upload bukti transfer</span>
            <span className="text-xs">JPG/PNG, maksimal 8MB</span>
            <input id="proof" type="file" accept="image/*" onChange={handleProofChange} className="hidden" />
          </label>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Catatan (opsional)</Label>
        <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Misal: ambil langsung pas event, atau catatan lain" />
      </div>

      <Button type="button" size="lg" className="w-full" onClick={handleSubmit} disabled={checkout.isPending || ordersClosed}>
        {checkout.isPending ? <Loader2 size={16} className="animate-spin" /> : 'Buat Pesanan'}
      </Button>
    </div>
  );
}
