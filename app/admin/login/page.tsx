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

export default function AdminLoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setServerError(null);
      setIsSubmitting(true);

      try {
        const res = await signIn('admin-login', {
          email: value.email,
          password: value.password,
          redirect: false,
        });

        if (res?.error) {
          setServerError('Email atau password salah');
          return;
        }

        toast.success('Berhasil masuk sebagai admin');
        router.push('/admin/dashboard');
        router.refresh();
      } catch {
        setServerError('Terjadi kesalahan, coba lagi');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <AuthCard title="Admin Login" description="Khusus untuk pengelola Kawan Pelarian">
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
              <Label htmlFor="password">Password</Label>
              <PasswordInput id="password" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} placeholder="Password admin" />
              {field.state.meta.errors.length > 0 && <p className="text-sm text-destructive">{field.state.meta.errors[0]?.message}</p>}
            </div>
          )}
        </form.Field>

        {serverError && <p className="text-sm text-destructive">{serverError}</p>}

        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? 'Memproses...' : 'Masuk'}
        </Button>
      </form>
    </AuthCard>
  );
}
