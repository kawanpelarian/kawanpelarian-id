'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqItems = [
  {
    question: 'Apakah harus punya pace cepat buat ikutan?',
    answer: 'Enggak sama sekali. Kawan Pelarian itu komunitas lari santai, fokusnya kebersamaan bukan kecepatan. Siapapun boleh gabung, dari pemula sampai yang udah biasa lari.',
  },
  {
    question: 'Ada biaya buat ikut event?',
    answer: 'Event mingguan kita gratis. Info lebih detail soal event tertentu bisa dicek langsung di halaman Event.',
  },
  {
    question: 'Perlu perlengkapan khusus?',
    answer: 'Cukup sepatu lari yang nyaman dan pakaian yang enak dipakai gerak. Gak perlu alat mahal buat mulai lari bareng kita.',
  },
  {
    question: 'Gimana cara daftar event?',
    answer: 'Bikin akun dulu lewat halaman "Daftar", lalu pilih event yang mau diikuti dan klik tombol daftar. Gampang, gak ribet.',
  },
];

function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-2">
      {faqItems.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={index} className="rounded-xl border border-border">
            <button type="button" onClick={() => setOpenIndex(isOpen ? null : index)} aria-expanded={isOpen} aria-controls={`faq-answer-${index}`} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
              <span className="text-sm font-medium text-primaryBlack dark:text-primaryWhite">{item.question}</span>
              <ChevronDown size={18} className={cn('shrink-0 text-muted-foreground transition-transform duration-200', isOpen && 'rotate-180')} />
            </button>

            <div id={`faq-answer-${index}`} role="region" className={cn('grid transition-all duration-200 ease-in-out', isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
              <div className="overflow-hidden">
                <p className="px-5 pb-4 text-sm text-muted-foreground">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function AboutSection() {
  return (
    <section id="about" className="mx-auto max-w-5xl scroll-mt-20 px-6 py-20 lg:px-8">
      <div className="space-y-16">
        {/* Cerita Komunitas */}
        <div className="space-y-4 text-center">
          <h2 className="font-title text-3xl font-black uppercase italic text-primaryBlack dark:text-primaryWhite sm:text-4xl">Cerita Kami</h2>
          <p className="mx-auto max-w-2xl text-[15px] text-muted-foreground">
            Kawan Pelarian lahir dari niat sederhana: pengen olahraga tapi males kalau sendirian. Dari sekumpulan teman yang lari bareng tiap akhir pekan, sekarang udah jadi komunitas yang terbuka buat siapapun di Medan yang mau gerak
            santai bareng, tanpa tekanan target atau kecepatan tertentu.
          </p>
        </div>

        {/* Visi Misi */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2 rounded-xl border border-border p-6">
            <h3 className="font-title text-lg font-semibold uppercase text-primaryBlack dark:text-primaryWhite">Visi</h3>
            <p className="text-sm text-muted-foreground">Jadi ruang lari yang inklusif dan ramah buat semua kalangan di Medan, tanpa memandang usia, kecepatan, atau pengalaman.</p>
          </div>

          <div className="space-y-2 rounded-xl border border-border p-6">
            <h3 className="font-title text-lg font-semibold uppercase text-primaryBlack dark:text-primaryWhite">Misi</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Rutin ngadain event lari mingguan yang gratis dan terbuka</li>
              <li>• Bangun kebersamaan lewat aktivitas sehat</li>
              <li>• Ciptain ruang aman buat siapapun mulai kebiasaan lari</li>
            </ul>
          </div>
        </div>

        {/* FAQ */}
        <div className="space-y-6">
          <h3 className="font-title text-center text-2xl font-black uppercase italic text-primaryBlack dark:text-primaryWhite">Pertanyaan Umum</h3>
          <FaqAccordion />
        </div>
      </div>
    </section>
  );
}
