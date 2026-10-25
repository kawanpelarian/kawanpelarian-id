// hooks/use-scroll-spy.ts
import { useEffect, useState } from 'react';

export function useScrollSpy(sectionIds: string[]) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const elements = sectionIds.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries.filter((entry) => entry.isIntersecting);

        if (intersecting.length === 0) return;

        // Kalau lebih dari satu section "kelihatan" bareng di area pantauan,
        // pilih yang posisinya paling atas (paling deket ke viewport top)
        const topMost = intersecting.reduce((closest, entry) => (entry.boundingClientRect.top < closest.boundingClientRect.top ? entry : closest));

        setActiveId(topMost.target.id);
      },
      {
        // Trigger pas section-nya lagi di area tengah-atas viewport
        rootMargin: '-30% 0px -60% 0px',
        threshold: 0,
      },
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [sectionIds]);

  return activeId;
}
