// app/admin/(dashboard)/scan/page.tsx
'use client';

import { QrScannerView } from '@/components/shared/qr-scanner-view';

export default function AdminScanPage() {
  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-primaryBlack dark:text-primaryWhite">Pemindai Check-in</h1>
        <p className="text-sm text-muted-foreground">Scan QR peserta untuk mencatat kehadiran</p>
      </div>

      <QrScannerView />
    </div>
  );
}
