// app/(member)/scan/page.tsx
'use client';

import { Loader2, ShieldAlert } from 'lucide-react';
import { QrScannerView } from '@/components/shared/qr-scanner-view';
import { useScanAccess } from '@/hooks/use-scan';

export default function MemberScanPage() {
  const { data: allowed, isLoading } = useScanAccess();

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-primaryBlack dark:text-primaryWhite">Pemindai Check-in</h1>
        <p className="text-[15px] text-muted-foreground">Scan QR peserta untuk mencatat kehadiran</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-muted-foreground" />
        </div>
      ) : allowed ? (
        <QrScannerView />
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
          <ShieldAlert size={28} />
          <p className="text-sm">Halaman ini khusus panitia</p>
        </div>
      )}
    </div>
  );
}
