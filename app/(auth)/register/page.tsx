// app/(auth)/register/page.tsx
'use client';

import { useForm } from '@tanstack/react-form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { registerSchema } from '@/schemas/auth.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { AuthCard } from '@/components/auth/auth-card';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setServerError(null);
      setIsSubmitting(true);

      try {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(value),
        });

        const data = await res.json();

        if (!res.ok) {
          setServerError(data.error || 'Registrasi gagal');
          return;
        }

        toast.success('Registrasi berhasil, silakan masuk');
        router.push('/login');
      } catch {
        setServerError('Terjadi kesalahan, coba lagi');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <AuthCard
      title="Daftar Akun"
      description="Bergabung bersama komunitas Kawan Pelarian"
      footer={
        <>
          Sudah punya akun?{' '}
          <a href="/login" className="font-medium text-primaryBlack underline underline-offset-4 dark:text-primaryWhite">
            Masuk di sini
          </a>
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-6"
      >
        <form.Field
          name="name"
          validators={{
            onChange: registerSchema.shape.name,
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input id="name" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} placeholder="Nama lengkap kamu" />
              {field.state.meta.errors.length > 0 && <p className="text-sm text-destructive">{field.state.meta.errors[0]?.message}</p>}
            </div>
          )}
        </form.Field>

        <form.Field
          name="email"
          validators={{
            onChange: registerSchema.shape.email,
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
          name="phone"
          validators={{
            onChange: registerSchema.shape.phone,
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor="phone">Nomor HP / WhatsApp</Label>
              <Input id="phone" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} placeholder="08xxxxxxxxxx" />
              {field.state.meta.errors.length > 0 && <p className="text-sm text-destructive">{field.state.meta.errors[0]?.message}</p>}
            </div>
          )}
        </form.Field>

        <form.Field
          name="password"
          validators={{
            onChange: registerSchema.shape.password,
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput id="password" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} placeholder="Minimal 8 karakter" />
              {field.state.meta.errors.length > 0 && <p className="text-sm text-destructive">{field.state.meta.errors[0]?.message}</p>}
            </div>
          )}
        </form.Field>

        {serverError && <p className="text-sm text-destructive">{serverError}</p>}

        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? 'Memproses...' : 'Daftar'}
        </Button>
      </form>
    </AuthCard>
  );
}
