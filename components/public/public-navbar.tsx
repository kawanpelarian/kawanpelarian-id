// components/public/public-navbar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { toast } from 'sonner';
import { useMediaQuery } from 'usehooks-ts';
import { Menu, UserRound, CalendarCheck2, LogOut, ShoppingCart } from 'lucide-react';
import { Logo } from '@/components/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { useCartStore } from '@/store/cart-store';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useScrollSpy } from '@/hooks/use-scroll-spy';

// url = tujuan navigasi (klik). homeSectionId = section yang dipantau scroll-spy
// pas lagi di homepage ("/"), buat nentuin menu mana yang "aktif" real-time.
const menuItems = [
  { title: 'Beranda', url: '/', sectionId: null, homeSectionId: 'hero' },
  { title: 'Tentang', url: '/#about', sectionId: 'about', homeSectionId: 'about' },
  { title: 'Event', url: '/events', sectionId: null, homeSectionId: 'events-preview' },
  { title: 'Merchandise', url: '/merchandise', sectionId: null, homeSectionId: 'merchandise' },
  { title: 'Galeri', url: '/gallery', sectionId: null, homeSectionId: 'gallery-preview' },
];

const sectionIds = menuItems.map((item) => item.homeSectionId).filter((id): id is string => id !== null);

const navButtonOutlineClass =
  'rounded-full border border-primaryBlack bg-transparent px-5 text-primaryBlack transition-colors duration-300 hover:bg-primaryBlack hover:text-primaryWhite dark:border-primaryWhite dark:text-primaryWhite dark:hover:bg-primaryWhite dark:hover:text-primaryBlack';

const navButtonSolidClass = 'rounded-full border-0 bg-primaryBlack px-5 text-primaryWhite transition-colors duration-300 hover:bg-primaryBlack/90 dark:bg-primaryWhite dark:text-primaryBlack dark:hover:bg-primaryWhite/90';

export function PublicNavbar() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const isLoggedIn = status === 'authenticated' && session?.user.role === 'MEMBER';

  const handleLogout = async () => {
    await signOut({ redirect: false });
    toast.success('Berhasil keluar');
    setIsSheetOpen(false);
    router.push('/');
  };

  const isDesktop = useMediaQuery('(min-width: 1024px)', { initializeWithValue: false });
  const cartCount = useCartStore((s) => s.items.reduce((sum, item) => sum + item.quantity, 0));

  // Scroll-spy cuma relevan pas lagi di landing page ("/")
  const activeSectionId = useScrollSpy(sectionIds);

  const isItemActive = (item: (typeof menuItems)[number]) => {
    if (pathname === '/') {
      // Di homepage, status aktif murni ngikutin section mana yang lagi
      // "kelihatan" pas discroll, apapun url tujuan klik-nya
      return activeSectionId === item.homeSectionId;
    }

    // Di halaman lain: exact match, ATAU prefix match buat item yang punya
    // sub-route (misal /events/[slug] tetap bikin menu "Event" aktif)
    if (item.url === '/') return false;
    return pathname === item.url || pathname.startsWith(`${item.url}/`);
  };

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, item: (typeof menuItems)[number]) => {
    if (!item.sectionId) return;

    if (pathname === '/') {
      // Udah di landing page -> smooth scroll native (Lenis udah dimatiin)
      e.preventDefault();
      document.getElementById(item.sectionId)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      setIsSheetOpen(false);
    }
    // Kalau lagi di halaman lain, biarin <Link> jalan normal -> navigasi ke "/"
    // terus browser otomatis scroll ke #hash begitu halaman selesai load
  };

  const NavLink = ({ item, className }: { item: (typeof menuItems)[number]; className: string }) => (
    <Link href={item.url} onClick={(e) => handleAnchorClick(e, item)} className={className}>
      {item.title}
    </Link>
  );

  return (
    <header className="fixed top-0 z-50 w-full bg-background">
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-3 items-center px-6 py-2 lg:h-16 lg:px-8 lg:py-0">
        {/* Kiri: menu (desktop) / hamburger (mobile) */}
        <div className="flex items-center gap-6">
          {isDesktop ? (
            <nav className="flex items-center gap-6">
              {menuItems.map((item) => (
                <NavLink
                  key={item.url}
                  item={item}
                  className={cn('text-sm transition-colors', isItemActive(item) ? 'font-bold text-primaryBlack dark:text-primaryWhite' : 'text-muted-foreground hover:text-primaryBlack dark:hover:text-primaryWhite')}
                />
              ))}
            </nav>
          ) : (
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger render={<Button variant="ghost" size="icon" />}>
                <Menu size={22} />
              </SheetTrigger>
              <SheetContent side="left" className="flex w-72 flex-col">
                <SheetHeader>
                  <SheetTitle className="flex h-8 items-center">
                    <Logo width={114} height={32} className="h-8 w-auto object-contain" />
                  </SheetTitle>
                </SheetHeader>

                <nav className="flex flex-col gap-1 px-4">
                  {menuItems.map((item) => (
                    <NavLink
                      key={item.url}
                      item={item}
                      className={cn('rounded-md px-3 py-2.5 text-sm transition-colors', isItemActive(item) ? 'font-bold text-primaryBlack dark:text-primaryWhite' : 'text-muted-foreground hover:bg-accent')}
                    />
                  ))}
                </nav>

                <div className="mt-auto flex flex-col gap-2 px-4 pb-6">
                  {isLoggedIn ? (
                    <>
                      <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2.5">
                        <UserRound size={16} className="text-muted-foreground" />
                        <Link href={`/profile`} className="text-sm font-medium text-primaryBlack dark:text-primaryWhite">
                          {session?.user.name}
                        </Link>
                      </div>
                      <Button variant="outline" className={cn('w-full', navButtonOutlineClass)} render={<Link href="/my-events" />} nativeButton={false} onClick={() => setIsSheetOpen(false)}>
                        <CalendarCheck2 size={16} />
                        Event Saya
                      </Button>
                      <Button variant="ghost" className="w-full text-destructive" onClick={handleLogout}>
                        <LogOut size={16} />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button className={cn('w-full', navButtonSolidClass)} render={<Link href="/register" />} nativeButton={false} onClick={() => setIsSheetOpen(false)}>
                        Daftar
                      </Button>
                      <Button variant="outline" className={cn('w-full', navButtonOutlineClass)} render={<Link href="/login" />} nativeButton={false} onClick={() => setIsSheetOpen(false)}>
                        Masuk
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>

        {/* Tengah: logo */}
        <div className="flex justify-center">
          <Link href="/" className="flex h-10 items-center">
            <Logo width={114} height={114} className="h-10 w-auto object-contain" />
          </Link>
        </div>

        {/* Kanan: cart + theme toggle + auth (desktop only) */}
        <div className="flex items-center justify-end gap-2">
          {isDesktop ? (
            <>
              {isLoggedIn && (
                <Button variant="ghost" size="icon" className="relative" render={<Link href="/checkout" />} nativeButton={false}>
                  <ShoppingCart size={18} />
                  {cartCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primaryBlack text-[10px] font-semibold text-primaryWhite dark:bg-primaryWhite dark:text-primaryBlack">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Button>
              )}
              <ThemeToggle />
              {isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
                    <UserRound size={18} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="px-2 py-1.5 text-sm font-medium text-primaryBlack dark:text-primaryWhite">{session?.user.name}</div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem render={<Link href="/my-events" />}>
                      <CalendarCheck2 size={14} />
                      Event Saya
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                      <LogOut size={14} />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button className={navButtonSolidClass} render={<Link href="/register" />} nativeButton={false}>
                    Daftar
                  </Button>
                  <Button variant="ghost" className={navButtonOutlineClass} render={<Link href="/login" />} nativeButton={false}>
                    Masuk
                  </Button>
                </>
              )}
            </>
          ) : (
            <>
              {isLoggedIn && (
                <Button variant="ghost" size="icon" className="relative" render={<Link href="/checkout" />} nativeButton={false}>
                  <ShoppingCart size={18} />
                  {cartCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primaryBlack text-[10px] font-semibold text-primaryWhite dark:bg-primaryWhite dark:text-primaryBlack">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Button>
              )}
              <ThemeToggle />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
