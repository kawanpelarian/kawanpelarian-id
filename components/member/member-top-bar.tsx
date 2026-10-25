'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { toast } from 'sonner';
import { UserRound, LogOut, ShoppingCart } from 'lucide-react';
import { Logo } from '@/components/logo';
import { useCartStore } from '@/store/cart-store';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function MemberTopBar() {
  const router = useRouter();
  const cartCount = useCartStore((s) => s.items.reduce((sum, item) => sum + item.quantity, 0));

  const handleLogout = async () => {
    await signOut({ redirect: false });
    toast.success('Berhasil keluar');
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background px-4">
      <Link href="/" className="flex h-10 items-center">
        <Logo width={114} height={114} className="h-10 w-auto object-contain" />
      </Link>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="relative" render={<Link href="/checkout" />} nativeButton={false}>
          <ShoppingCart size={18} />
          {cartCount > 0 && <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brandYellow text-[10px] font-semibold text-brandNavy">{cartCount > 9 ? '9+' : cartCount}</span>}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
            <UserRound size={18} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem render={<Link href="/profile" />}>
              <UserRound size={14} />
              Lihat Profil
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={handleLogout}>
              <LogOut size={14} />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
