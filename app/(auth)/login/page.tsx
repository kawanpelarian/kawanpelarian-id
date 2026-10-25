// app/(auth)/login/page.tsx
'use client';

import { useForm } from '@tanstack/react-form';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { loginSchema } from '@/schemas/auth.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { AuthCard } from '@/components/auth/auth-card';
import { toast } from 'sonner';

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    await signIn('google', { callbackUrl: '/my-events' });
  };

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setServerError(null);
      setIsSubmitting(true);

      try {
        const res = await signIn('member-login', {
          email: value.email,
          password: value.password,
          redirect: false,
        });

        if (res?.error) {
          setServerError('Email atau password salah');
          return;
        }

        toast.success('Berhasil masuk, selamat datang kembali!');
        router.push('/my-events');
        router.refresh();
      } catch {
        setServerError('Terjadi kesalahan, coba lagi');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <AuthCard
      title="Selamat Datang Kembali"
      description="Masuk untuk lanjut ikutan lari bareng"
      footer={
        <>
          Belum punya akun?{' '}
          <a href="/register" className="font-medium text-primaryBlack underline underline-offset-4 dark:text-primaryWhite">
            Daftar di sini
          </a>
        </>
      }
    >
      <div className="space-y-6">
        <Button type="button" variant="outline" className="w-full" size="lg" onClick={handleGoogleLogin} disabled={isGoogleLoading}>
          <GoogleIcon className="h-4 w-4" />
          {isGoogleLoading ? 'Menghubungkan...' : 'Login dengan Google'}
        </Button>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">atau</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-6"
        >
          <form.Field
            name="email"
            validators={{
              onChange: loginSchema.shape.email,
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} placeholder="email@contoh.com" />
                {field.state.meta.errors.length > 0 && <p className="text-sm text-destructive">{field.state.meta.errors[0]?.message}</p>}
              </div>
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onChange: loginSchema.shape.password,
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a href="/forgot-password" className="text-xs text-muted-foreground underline-offset-4 hover:text-primaryBlack hover:underline dark:hover:text-primaryWhite">
                    Lupa password?
                  </a>
                </div>
                <PasswordInput id="password" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} placeholder="Password kamu" />
                {field.state.meta.errors.length > 0 && <p className="text-sm text-destructive">{field.state.meta.errors[0]?.message}</p>}
              </div>
            )}
          </form.Field>

          {serverError && <p className="text-sm text-destructive">{serverError}</p>}

          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Memproses...' : 'Masuk'}
          </Button>
        </form>
      </div>
    </AuthCard>
  );
}
