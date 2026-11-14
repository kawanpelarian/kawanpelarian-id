// components/shared/qr-scanner-view.tsx
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { Camera, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toTitleCase } from '@/lib/format-name';
import { useScanCheckIn, type ScanResult } from '@/hooks/use-scan';

export function QrScannerView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const busyRef = useRef(false);

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const scan = useScanCheckIn();

  const stopCamera = useCallback(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const handleToken = useCallback(
    async (token: string) => {
      busyRef.current = true;

      try {
        const data = await scan.mutateAsync(token);
        setResult(data);
        if (navigator.vibrate) navigator.vibrate(data.ok ? 120 : [80, 60, 80]);
      } catch {
        setResult({ ok: false, code: 'NETWORK', message: 'Koneksi bermasalah, coba scan lagi' });
      }
    },
    [scan],
  );

  const tick = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA && !busyRef.current) {
      const width = video.videoWidth;
      const height = video.videoHeight;
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (ctx) {
        ctx.drawImage(video, 0, 0, width, height);
        const code = jsQR(ctx.getImageData(0, 0, width, height).data, width, height, {
          inversionAttempts: 'dontInvert',
        });

        if (code?.data) {
          void handleToken(code.data);
        }
      }
    }

    frameRef.current = requestAnimationFrame(tick);
  }, [handleToken]);

  const startCamera = useCallback(async () => {
    setCameraError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Browser tidak mendukung kamera, atau halaman tidak memakai HTTPS');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      frameRef.current = requestAnimationFrame(tick);
    } catch {
      setCameraError('Akses kamera ditolak. Izinkan kamera di pengaturan browser lalu coba lagi');
    }
  }, [tick]);

  useEffect(() => {
    void startCamera();
    return stopCamera;
  }, [startCamera, stopCamera]);

  const scanNext = () => {
    setResult(null);
    busyRef.current = false;
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-black">
        <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
        <canvas ref={canvasRef} className="hidden" />

        {!cameraError && !result && <div className="pointer-events-none absolute inset-8 rounded-xl border-2 border-white/70" />}

        {scan.isPending && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="animate-spin text-white" size={32} />
          </div>
        )}

        {cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-white">
            <Camera size={28} />
            <p className="text-sm">{cameraError}</p>
            <Button type="button" variant="secondary" onClick={() => void startCamera()}>
              Coba Lagi
            </Button>
          </div>
        )}
      </div>

      {result ? (
        <div className={result.ok ? 'space-y-3 rounded-xl border border-green-500/40 bg-green-500/10 p-4' : 'space-y-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4'}>
          <div className="flex items-start gap-3">
            {result.ok ? <CheckCircle2 className="mt-0.5 shrink-0 text-green-600" size={22} /> : <XCircle className="mt-0.5 shrink-0 text-destructive" size={22} />}

            <div className="min-w-0 space-y-0.5">
              {result.member && <p className="truncate text-base font-semibold text-primaryBlack dark:text-primaryWhite">{toTitleCase(result.member.name)}</p>}
              <p className="text-sm text-muted-foreground">{result.ok ? `Check-in berhasil, hadir ke-${result.attendedCount}` : result.message}</p>
              {result.eventName && <p className="truncate text-xs text-muted-foreground">{result.eventName}</p>}
              {result.ok && result.newBadge && <p className="text-xs font-medium text-green-700 dark:text-green-400">Lencana baru: {result.newBadge.name}</p>}
            </div>
          </div>

          <Button type="button" className="w-full" onClick={scanNext}>
            Scan Berikutnya
          </Button>
        </div>
      ) : (
        <p className="text-center text-sm text-muted-foreground">Arahkan kamera ke QR check-in peserta</p>
      )}
    </div>
  );
}
