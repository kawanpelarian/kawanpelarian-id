// app/(auth)/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import { MailCheck } from 'lucide-react';
import { forgotPasswordSchema } from '@/schemas/auth.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthCard } from '@/components/auth/auth-card';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Email tidak valid');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Terjadi kesalahan, coba lagi');
        return;
      }

      setIsSent(true);
    } catch {
      setError('Terjadi kesalahan, coba lagi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Lupa Password?"
      description="Masukkan email akunmu, kami kirimkan link untuk mengatur ulang password"
      footer={
        <a href="/login" className="font-medium text-primaryBlack underline underline-offset-4 dark:text-primaryWhite">
          Kembali ke halaman login
        </a>
      }
    >
      {isSent ? (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <MailCheck className="h-6 w-6" />
          </div>
          <p className="text-sm text-muted-foreground">
            Jika <strong className="text-foreground">{email}</strong> terdaftar, link reset password sudah dikirim. Cek inbox atau folder spam. Link berlaku 60 menit.
          </p>
          <Button variant="outline" className="w-full" onClick={() => setIsSent(false)}>
            Kirim ulang ke email lain
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@contoh.com" autoComplete="email" />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Mengirim...' : 'Kirim Link Reset'}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
