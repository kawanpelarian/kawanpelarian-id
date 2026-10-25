// lib/partners.ts
// Daftar kolaborator & sponsor. Tinggal tambah/hapus item di sini.
// Taruh file logo di public/images/partners/ (PNG/SVG/WebP, background transparan lebih bagus).

export interface Partner {
  name: string;
  logo: string; // path di /public, atau URL Cloudinary
  href?: string; // opsional, kalau diisi logo jadi bisa diklik
}

export const partners: Partner[] = [
  // Contoh (hapus tanda komentar lalu ganti dengan data asli):
  // { name: 'Nama Sponsor', logo: '/images/partners/nama-sponsor.png', href: 'https://contoh.com' },
  // { name: 'Nama Kolaborator', logo: '/images/partners/nama-kolaborator.svg' },
];
