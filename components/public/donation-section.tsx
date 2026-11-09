// components/public/donation-section.tsx
import Image from 'next/image';
import { Download } from 'lucide-react';

const QRIS_IMAGE = '/images/qris.jpeg';

const donationUses = ['Air minum dan perlengkapan tiap event', 'Dokumentasi foto dan video', 'Operasional komunitas biar event tetap gratis'];

export function DonationSection() {
  return (
    <section id="donasi" className="mx-auto max-w-5xl scroll-mt-20 px-6 py-20 lg:px-8">
      <div className="grid grid-cols-1 items-center gap-10 rounded-2xl border border-border p-6 sm:p-10 md:grid-cols-2">
        <div className="space-y-5">
          <h2 className="font-title text-3xl font-black uppercase italic text-primaryBlack dark:text-primaryWhite sm:text-4xl">Donasi</h2>

          <p className="text-[15px] text-muted-foreground">Kawan Pelarian jalan dari kebersamaan. Kalau kamu suka lari bareng kita dan mau bantu komunitas ini terus jalan, donasi seikhlasnya sangat berarti.</p>

          <ul className="space-y-2 text-sm text-muted-foreground">
            {donationUses.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden>•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mx-auto flex w-full max-w-xs flex-col items-center gap-4">
          <div className="w-full overflow-hidden rounded-xl border border-border bg-white p-3">
            <Image src={QRIS_IMAGE} alt="QRIS donasi Kawan Pelarian" width={600} height={600} className="h-auto w-full" />
          </div>

          <p className="text-center text-xs text-muted-foreground">Scan pakai e-wallet atau mobile banking apa pun yang mendukung QRIS</p>

          <a
            href={QRIS_IMAGE}
            download="qris-kawan-pelarian.png"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-input bg-background px-4 text-sm font-medium shadow-sm transition-colors hover:bg-accent"
          >
            <Download size={16} />
            Unduh QRIS
          </a>
        </div>
      </div>
    </section>
  );
}
