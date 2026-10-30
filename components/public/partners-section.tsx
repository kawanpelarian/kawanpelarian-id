// components/public/partners-section.tsx
import Image from 'next/image';
import { getPartners, type Partner } from '@/lib/partners';
import { cn } from '@/lib/utils';

const MIN_ITEMS_PER_GROUP = 8;
const SECONDS_PER_LOGO = 4;

function PartnerLogo({ partner }: { partner: Partner }) {
  const card = (
    <div className="relative h-28 w-56 shrink-0 overflow-hidden rounded-xl border border-border bg-[#e6e9f1] dark:border-white/15 dark:bg-card">
      <Image src={partner.logo} alt={partner.name} fill sizes="224px" className="object-contain p-1.5" />
    </div>
  );

  if (!partner.href) return card;

  return (
    <a href={partner.href} target="_blank" rel="noopener noreferrer" aria-label={partner.name} className="transition-opacity hover:opacity-80">
      {card}
    </a>
  );
}

export async function PartnersSection() {
  const partners = await getPartners();

  if (partners.length === 0) return null;

  const repeat = Math.max(1, Math.ceil(MIN_ITEMS_PER_GROUP / partners.length));
  const items = Array.from({ length: repeat }).flatMap(() => partners);
  const duration = `${items.length * SECONDS_PER_LOGO}s`;

  return (
    <section id="partners" className="py-20">
      <div className="mx-auto mb-10 max-w-5xl px-6 text-center lg:px-8">
        <h2 className="font-title text-3xl font-black uppercase italic text-primaryBlack dark:text-primaryWhite sm:text-4xl">Kolaborasi & Sponsor</h2>
        <p className="mt-2 text-[15px] text-muted-foreground">Terima kasih untuk semua yang sudah mendukung Kawan Pelarian</p>
      </div>

      <div className="group relative overflow-hidden mask-[linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] motion-reduce:overflow-x-auto">
        <div className="flex w-max">
          {[0, 1].map((copy) => (
            <div key={copy} aria-hidden={copy === 1} style={{ animationDuration: duration }} className={cn('flex shrink-0 animate-marquee items-center gap-6 pr-6', 'group-hover:paused motion-reduce:animate-none')}>
              {items.map((partner, i) => (
                <PartnerLogo key={`${copy}-${i}`} partner={partner} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
