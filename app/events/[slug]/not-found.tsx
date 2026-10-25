// app/events/[slug]/not-found.tsx
import Link from 'next/link';
import { CalendarX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EventNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <CalendarX size={48} className="text-muted-foreground" />

      <div className="space-y-2">
        <h1 className="text-3xl font-black uppercase italic text-primaryBlack dark:text-primaryWhite">Event Gak Ketemu</h1>
        <p className="max-w-md text-[15px] text-muted-foreground">Event ini mungkin udah dihapus, belum di-publish, atau link-nya salah ketik. Coba cek lagi daftar event yang ada.</p>
      </div>

      <Button size="lg" className="rounded-full bg-brandYellow px-8 text-brandNavy hover:bg-brandYellow/90" render={<Link href="/events" />} nativeButton={false}>
        Lihat Semua Event
      </Button>
    </div>
  );
}
