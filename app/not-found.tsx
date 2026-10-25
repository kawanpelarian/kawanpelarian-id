// app/not-found.tsx
import Link from 'next/link';
import { CompassIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <CompassIcon size={48} className="text-muted-foreground" />

      <div className="space-y-2">
        <h1 className="text-4xl font-black uppercase italic text-primaryBlack dark:text-primaryWhite">404</h1>
        <p className="text-[15px] text-muted-foreground">Halaman yang kamu cari kayaknya nyasar, kayak rute lari yang belum kita jajal.</p>
      </div>

      <Button size="lg" className="rounded-full bg-brandYellow px-8 text-brandNavy hover:bg-brandYellow/90" render={<Link href="/" />} nativeButton={false}>
        Balik ke Beranda
      </Button>
    </div>
  );
}
