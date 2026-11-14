// components/member/check-in-qr.tsx
'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import QRCode from 'qrcode';
import { CheckCircle2, Loader2, QrCode, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMyEvents } from '@/hooks/use-my-events';

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
  const queryClient = useQueryClient();
  const registrationId = token.split('.')[0];

  // Cek tiap 3 detik selama modal terbuka, supaya otomatis berubah begitu panitia selesai scan
  const { data, refetch, isFetching } = useMyEvents(open ? 3000 : false);

  const registration = [...(data?.upcoming ?? []), ...(data?.past ?? [])].find((r) => r.id === registrationId);
  const isCheckedIn = registration?.status === 'CHECKED_IN';

  useEffect(() => {
    if (isCheckedIn) {
      queryClient.invalidateQueries({ queryKey: ['public-events'] });
      queryClient.invalidateQueries({ queryKey: ['my-badges'] });
    }
  }, [isCheckedIn, queryClient]);

  return (
    <>
      <Button type="button" size="lg" className="w-full" onClick={() => setOpen(true)}>
        <QrCode size={16} />
        Tampilkan QR Check-in
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          {isCheckedIn ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle2 className="text-green-600" size={56} />
              <DialogHeader className="items-center">
                <DialogTitle>Check-in Berhasil</DialogTitle>
                <DialogDescription>Kehadiranmu di {eventName} sudah tercatat. Selamat berlari!</DialogDescription>
              </DialogHeader>
              <Button type="button" className="w-full" onClick={() => setOpen(false)}>
                Tutup
              </Button>
            </div>
          ) : (
            <>
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

              <Button type="button" variant="outline" className="w-full" onClick={() => void refetch()} disabled={isFetching}>
                {isFetching ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                Refresh Status
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
