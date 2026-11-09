// components/public/partners-marquee.tsx
'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import type { Partner } from '@/lib/partners';

const SPEED_PX_PER_SECOND = 40;
const RESUME_DELAY_MS = 1500;

function PartnerLogo({ partner }: { partner: Partner }) {
  const card = (
    <div className="relative h-28 w-56 shrink-0 overflow-hidden rounded-xl border border-border bg-[#e6e9f1] dark:border-white/15 dark:bg-card">
      <Image src={partner.logo} alt={partner.name} fill sizes="224px" draggable={false} className="select-none object-contain p-1.5" />
    </div>
  );

  if (!partner.href) return card;

  return (
    <a href={partner.href} target="_blank" rel="noopener noreferrer" aria-label={partner.name} draggable={false} className="transition-opacity hover:opacity-80">
      {card}
    </a>
  );
}

export function PartnersMarquee({ partners }: { partners: Partner[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const firstCopyRef = useRef<HTMLDivElement>(null);
  const position = useRef(0);
  const hovering = useRef(false);
  const dragging = useRef(false);
  const dragMoved = useRef(false);
  const dragStart = useRef({ x: 0, scroll: 0 });
  const pausedUntil = useRef(0);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const firstCopy = firstCopyRef.current;
    if (!scroller || !firstCopy) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    let last = performance.now();

    const wrap = (value: number) => {
      const loop = firstCopy.offsetWidth;
      if (loop <= 0) return value;
      if (value >= loop) return value - loop;
      if (value < 0) return value + loop;
      return value;
    };

    const tick = (now: number) => {
      const delta = (now - last) / 1000;
      last = now;

      const paused = hovering.current || dragging.current || now < pausedUntil.current;

      if (!paused) {
        position.current = wrap(position.current + SPEED_PX_PER_SECOND * delta);
        scroller.scrollLeft = position.current;
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, []);

  const syncFromScroller = () => {
    const scroller = scrollerRef.current;
    const firstCopy = firstCopyRef.current;
    if (!scroller || !firstCopy) return;

    if (Math.abs(scroller.scrollLeft - position.current) > 2) {
      const loop = firstCopy.offsetWidth;
      let next = scroller.scrollLeft;

      if (loop > 0) {
        if (next >= loop) next -= loop;
        else if (next <= 0) next += loop;
        if (next !== scroller.scrollLeft) scroller.scrollLeft = next;
      }

      position.current = next;
    }
  };

  const pauseTemporarily = () => {
    pausedUntil.current = performance.now() + RESUME_DELAY_MS;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;

    dragging.current = true;
    dragMoved.current = false;
    dragStart.current = { x: e.clientX, scroll: scrollerRef.current?.scrollLeft ?? 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current || !scrollerRef.current) return;

    const dx = e.clientX - dragStart.current.x;
    if (Math.abs(dx) > 5) dragMoved.current = true;

    scrollerRef.current.scrollLeft = dragStart.current.scroll - dx;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;

    dragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
    pauseTemporarily();
  };

  return (
    <div
      ref={scrollerRef}
      onScroll={syncFromScroller}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerEnter={(e) => {
        if (e.pointerType === 'mouse') hovering.current = true;
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === 'mouse') hovering.current = false;
      }}
      onTouchStart={() => {
        pausedUntil.current = Number.POSITIVE_INFINITY;
      }}
      onTouchEnd={pauseTemporarily}
      onClickCapture={(e) => {
        if (dragMoved.current) {
          e.preventDefault();
          e.stopPropagation();
          dragMoved.current = false;
        }
      }}
      className="relative cursor-grab select-none overflow-x-auto overscroll-x-contain mask-[linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] [-ms-overflow-style:none] scrollbar-none active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
    >
      <div className="flex w-max">
        {[0, 1].map((copy) => (
          <div key={copy} ref={copy === 0 ? firstCopyRef : undefined} aria-hidden={copy === 1} className="flex shrink-0 items-center gap-6 pr-6">
            {partners.map((partner, i) => (
              <PartnerLogo key={`${copy}-${i}`} partner={partner} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
