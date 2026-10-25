// components/member/member-bottom-menu.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, CalendarCheck2, History, Search, Home, ShoppingBag, Shirt, Users, UserRound } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';

const navItems = [
  { title: 'Beranda', url: '/', icon: Home },
  { title: 'Semua Event', url: '/events', icon: Search },
  { title: 'Event Saya', url: '/my-events', icon: CalendarCheck2 },
  { title: 'Riwayat', url: '/attendance', icon: History },
  { title: 'Merchandise', url: '/merchandise', icon: Shirt },
  { title: 'Pesanan Saya', url: '/my-orders', icon: ShoppingBag },
  { title: 'Member', url: '/members', icon: Users },
  { title: 'Profil', url: '/profile', icon: UserRound },
];

export function MemberBottomMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Bottom bar dengan background, tombol di dalamnya tetap polos */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between border-t border-border bg-background px-4 py-3">
        <ThemeToggle />
        <button type="button" onClick={() => setIsOpen((prev) => !prev)} className="flex h-9 w-9 items-center justify-center text-primaryBlack dark:text-primaryWhite">
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Bottom sheet: backdrop + panel grid menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="fixed inset-0 z-40 bg-black/40" />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t border-border bg-background px-4 pb-8 pt-3"
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />

              <div className="grid grid-cols-4 gap-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.url;
                  return (
                    <Link
                      key={item.url}
                      href={item.url}
                      onClick={() => setIsOpen(false)}
                      className={cn('flex flex-col items-center gap-2 rounded-xl border border-border px-1 py-4 text-center transition-colors', isActive ? 'bg-brandYellow text-brandNavy' : 'text-muted-foreground hover:bg-accent')}
                    >
                      <item.icon size={22} />
                      <span className="text-[11px] leading-tight">{item.title}</span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
