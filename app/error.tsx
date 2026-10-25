// app/error.tsx
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <AlertTriangle size={48} className="text-muted-foreground" />

      <div className="space-y-2">
        <h1 className="text-3xl font-black uppercase italic text-primaryBlack dark:text-primaryWhite">Ada yang Salah</h1>
        <p className="max-w-md text-[15px] text-muted-foreground">Kayaknya kita kesandung sesuatu di jalan. Coba lagi, atau balik ke beranda dulu.</p>
      </div>

      <div className="flex gap-3">
        <Button size="lg" variant="outline" className="rounded-full px-8" onClick={() => reset()}>
          Coba Lagi
        </Button>
        <Button size="lg" className="rounded-full bg-brandYellow px-8 text-brandNavy hover:bg-brandYellow/90" render={<Link href="/" />} nativeButton={false}>
          Balik ke Beranda
        </Button>
      </div>
    </div>
  );
}
