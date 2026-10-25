// components/member/member-avatar.tsx
import Image from 'next/image';
import { cn } from '@/lib/utils';

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
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

export function MemberAvatar({ name, avatarUrl, size = 'md', className }: MemberAvatarProps) {
  return (
    <span className={cn('relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brandNavy font-semibold text-brandYellow', sizes[size], className)}>
      {avatarUrl ? <Image src={avatarUrl} alt={name} fill sizes="96px" className="object-cover" /> : getInitials(name)}
    </span>
  );
}
