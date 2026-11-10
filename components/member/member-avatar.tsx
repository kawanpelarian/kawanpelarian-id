// components/member/member-avatar.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

const sizes = {
  sm: 'h-10 w-10 text-sm',
  md: 'h-14 w-14 text-lg',
  lg: 'h-24 w-24 text-3xl',
} as const;

interface MemberAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: keyof typeof sizes;
  className?: string;
  zoomable?: boolean;
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

export function MemberAvatar({ name, avatarUrl, size = 'md', className, zoomable = false }: MemberAvatarProps) {
  const [open, setOpen] = useState(false);
  const canZoom = zoomable && !!avatarUrl;

  const avatar = (
    <span className={cn('relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brandNavy font-semibold text-brandYellow', sizes[size], canZoom && 'transition-opacity group-hover:opacity-90', className)}>
      {avatarUrl ? <Image src={avatarUrl} alt={name} fill sizes="96px" className="object-cover" /> : getInitials(name)}
    </span>
  );

  if (!canZoom) return avatar;

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label={`Lihat foto profil ${name}`} className="group cursor-zoom-in rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
        {avatar}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-fit max-w-[calc(100%-2rem)] border-none bg-transparent p-0 shadow-none ring-0 sm:max-w-fit">
          <DialogTitle className="sr-only">Foto profil {name}</DialogTitle>
          <div className="relative aspect-square w-[min(85vw,24rem)] overflow-hidden rounded-xl bg-muted">
            <Image src={avatarUrl as string} alt={name} fill sizes="(max-width: 640px) 85vw, 384px" className="object-cover" />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
