// components/public/partners-section.tsx
import { getPartners } from '@/lib/partners';
import { PartnersMarquee } from '@/components/public/partners-marquee';

const MIN_ITEMS_PER_GROUP = 8;

export async function PartnersSection() {
  const partners = await getPartners();

  if (partners.length === 0) return null;

  const repeat = Math.max(1, Math.ceil(MIN_ITEMS_PER_GROUP / partners.length));
  const items = Array.from({ length: repeat }).flatMap(() => partners);

  return (
    <section id="partners" className="py-20">
      <div className="mx-auto mb-10 max-w-5xl px-6 text-center lg:px-8">
        <h2 className="font-title text-3xl font-black uppercase italic text-primaryBlack dark:text-primaryWhite sm:text-4xl">Kolaborasi & Sponsor</h2>
        <p className="mt-2 text-[15px] text-muted-foreground">Terima kasih untuk semua yang sudah mendukung Kawan Pelarian</p>
      </div>

      <PartnersMarquee partners={items} />
    </section>
  );
}
