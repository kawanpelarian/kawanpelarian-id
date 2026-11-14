// components/member/check-in-qr.tsx
'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface CheckInQrProps {
  token: string;
  eventName: string;
}

function useQrDataUrl(token: string) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    QRCode.toDataURL(token, { width: 480, margin: 2, errorCorrectionLevel: 'M' }).then((url) => {
      if (!cancelled) setDataUrl(url);
    });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return dataUrl;
}

export function CheckInQr({ token, eventName }: CheckInQrProps) {
  const [open, setOpen] = useState(false);
  const dataUrl = useQrDataUrl(token);

  return (
    <>
      <Button type="button" size="lg" className="w-full" onClick={() => setOpen(true)}>
        <QrCode size={16} />
        Tampilkan QR Check-in
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>QR Check-in</DialogTitle>
            <DialogDescription>Tunjukkan QR ini ke panitia di lokasi {eventName}. Naikkan kecerahan layar agar mudah dipindai.</DialogDescription>
          </DialogHeader>

          <div className="flex justify-center rounded-xl bg-white p-3">
            {dataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={dataUrl} alt="QR check-in" className="aspect-square w-full max-w-70" />
            ) : (
              <div className="aspect-square w-full max-w-70 animate-pulse rounded-lg bg-muted" />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
