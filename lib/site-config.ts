// lib/site-config.ts

// GANTI DOMAIN DI SINI AJA kalau nanti pindah/ganti domain, gak perlu bolak-balik ke file lain
export const siteConfig = {
  name: 'Kawan Pelarian',
  shortName: 'Kawan Pelarian',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kawanpelarian.com',
  description: 'Komunitas lari santai Pelan Pelan Lari (PPL) di Medan. Lari bareng tiap minggu, tanpa fokus kecepatan atau kompetisi, terbuka buat semua kalangan.',
  keywords: ['komunitas lari medan', 'lari santai', 'pelan pelan lari', 'kawan pelarian', 'running community medan'],
  ogImage: '/images/og-default.jpg',
  social: {
    instagram: 'https://instagram.com/kawanpelarian.official',
    threads: 'https://threads.net/@kawanpelarian',
    tiktok: 'https://tiktok.com/@kawanpelarian',
  },
  locale: 'id_ID',
  // Rekening tujuan transfer buat pembayaran merchandise, ganti di sini aja
  bankAccount: {
    bankName: 'MANDIRI',
    accountNumber: '1050016344776',
    accountHolder: 'MUHAMMAD FIKRI FADIL',
  },
} as const;
