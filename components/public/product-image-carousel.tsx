// components/public/product-image-carousel.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductImageCarouselProps {
  images: string[]; // udah gabungan imageUrl (cover) + images tambahan, urutan siap tampil
  alt: string;
}

export function ProductImageCarousel({ images, alt }: ProductImageCarouselProps) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) {
    return <div className="aspect-square w-full rounded-xl bg-muted" />;
  }

  const goPrev = () => setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const goNext = () => setIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <div className="space-y-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted">
        <Image src={images[index]} alt={`${alt} - ${index + 1}`} fill sizes="(max-width: 768px) 100vw, 768px" className="object-cover" priority={index === 0} />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Gambar sebelumnya"
              className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Gambar berikutnya"
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex justify-center gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Ke gambar ${i + 1}`}
              className={cn('h-1.5 rounded-full transition-all', i === index ? 'w-6 bg-primaryBlack dark:bg-primaryWhite' : 'w-1.5 bg-muted-foreground/30')}
            />
          ))}
        </div>
      )}
    </div>
  );
}
