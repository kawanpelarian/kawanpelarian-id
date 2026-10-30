import Link from 'next/link';
import { Logo } from '@/components/logo';

const menuItems = [
  { title: 'Beranda', url: '/' },
  { title: 'Tentang', url: '/about' },
  { title: 'Event', url: '/events' },
  { title: 'Galeri', url: '/gallery' },
];

const socialLinks = [
  { name: 'Instagram', url: 'https://www.instagram.com/kawanpelarian.official' },
  { name: 'Threads', url: 'https://threads.net/@kawanpelarian.official' },
];

const contactLinks = [
  { name: 'Admin WhatsApp 1', url: 'https://wa.me/6282283893133' },
  { name: 'Admin WhatsApp 2', url: 'https://wa.me/6281275826699' },
];

const legalLinks = [
  { name: 'Kebijakan Privasi', url: '/privacy-policy' },
  { name: 'Syarat & Ketentuan', url: '/terms-of-service' },
];

export function PublicFooter() {
  return (
    <footer className="overflow-hidden border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Kolom 1: Logo + Deskripsi */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex h-8 w-fit items-center">
              <Logo width={200} height={56} className="h-full w-auto object-contain" />
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground">Komunitas lari santai buat semua kalangan, tanpa fokus kecepatan atau kompetisi. Yuk lari pelan-pelan bareng kita tiap minggu di Medan.</p>
          </div>

          {/* Kolom 2: Our Menu */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-primaryBlack dark:text-primaryWhite">Our Menu</h3>
            <nav className="flex flex-col gap-3">
              {menuItems.map((item) => (
                <Link key={item.url} href={item.url} className="text-sm text-muted-foreground transition-colors hover:text-primaryBlack dark:hover:text-primaryWhite">
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>

          {/* Kolom 3: Social Media */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-primaryBlack dark:text-primaryWhite">Social Media</h3>
            <div className="flex flex-col gap-3">
              {socialLinks.map((social) => (
                <a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground transition-colors hover:text-primaryBlack dark:hover:text-primaryWhite">
                  {social.name}
                </a>
              ))}
            </div>
          </div>

          {/* Kolom 4: Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-primaryBlack dark:text-primaryWhite">Contact</h3>
            <div className="flex flex-col gap-3">
              {contactLinks.map((contact) => (
                <a key={contact.name} href={contact.url} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground transition-colors hover:text-primaryBlack dark:hover:text-primaryWhite">
                  {contact.name}
                </a>
              ))}
            </div>
          </div>

          {/* Kolom 5: Term and Privacy */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-primaryBlack dark:text-primaryWhite">Term and Privacy</h3>
            <div className="flex flex-col gap-3">
              {legalLinks.map((legal) => (
                <Link key={legal.url} href={legal.url} className="text-sm text-muted-foreground transition-colors hover:text-primaryBlack dark:hover:text-primaryWhite">
                  {legal.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Full-bleed, sengaja lebih lebar dari layar biar natural kepotong simetris di kedua tepi (K dan N) */}
      <div className="relative w-full overflow-hidden pb-4">
        <p className="footer-outline-text -mb-4 md:-mb-20 -ml-20 -mt-2 select-none whitespace-nowrap text-center text-[17vw] font-black italic uppercase leading-none tracking-tight">Kawan Pelarian</p>

        {/* Overlay gradient nutupin teks dari bawah (transparan) ke atas (solid bg-background) */}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background" />
      </div>
    </footer>
  );
}
