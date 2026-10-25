'use client';

import { useState } from 'react';
import { Link2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CopyLinkButtonProps {
  url: string;
  className?: string;
  variant?: 'outline' | 'ghost' | 'secondary';
  label?: string;
}

export function CopyLinkButton({ url, className, variant = 'outline', label = 'Salin Link' }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link berhasil disalin');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Gagal menyalin link');
    }
  };

  return (
    <Button type="button" variant={variant} className={cn('rounded-full', className)} onClick={handleCopy}>
      {copied ? <Check size={16} /> : <Link2 size={16} />}
      {copied ? 'Tersalin!' : label}
    </Button>
  );
}
