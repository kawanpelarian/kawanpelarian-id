// components/public/preorder-closed-banner.tsx
import { Lock } from 'lucide-react';

export function PreorderClosedBanner() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/40">
      <Lock size={18} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-500" />
      <p className="text-sm text-amber-800 dark:text-amber-400">
        <strong>Pre-order batch ini sudah ditutup.</strong> Pantau terus info batch berikutnya ya!
      </p>
    </div>
  );
}
