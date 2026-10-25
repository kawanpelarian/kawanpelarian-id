// app/(member)/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { LogOut, Loader2, AlertTriangle } from 'lucide-react';
import { useProfile, useUpdateProfile } from '@/hooks/use-profile';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BadgesCard } from '@/components/member/badges-card';
import { PublicProfileCard } from '@/components/member/public-profile-card';
import { ShareProfileCard } from '@/components/member/share-profile-card';

export default function ProfilePage() {
  const router = useRouter();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const [profileForm, setProfileForm] = useState({ name: '', phone: '', birthDate: '' });

  useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name,
        phone: profile.phone ?? '',
        birthDate: profile.birthDate ? profile.birthDate.slice(0, 10) : '',
      });
    }
  }, [profile]);

  const handleUpdateProfile = () => {
    updateProfile.mutate(profileForm, {
      onSuccess: () => toast.success('Profile berhasil diperbarui'),
      onError: (error) => toast.error(error.message),
    });
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    toast.success('Berhasil keluar');
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-md space-y-6 px-4 py-8">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-primaryBlack dark:text-primaryWhite">Profil</h1>
        <p className="text-[15px] text-muted-foreground">{profile?.email}</p>
      </div>

      {profile && !profile.phone && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/40">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-500" />
          <p className="text-sm text-amber-800 dark:text-amber-400">
            Nomor HP/WhatsApp kamu belum diisi (biasanya kejadian kalau daftar pakai Google).
            <strong> Wajib diisi dulu</strong> di bawah ini biar panitia bisa hubungin kamu kalau perlu.
          </p>
        </div>
      )}

      <BadgesCard />

      <PublicProfileCard />

      <ShareProfileCard />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data Diri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input id="name" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Nomor HP / WhatsApp</Label>
            <Input id="phone" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate">
              Tanggal Lahir <span className="text-muted-foreground">(opsional)</span>
            </Label>
            <Input id="birthDate" type="date" value={profileForm.birthDate} onChange={(e) => setProfileForm({ ...profileForm, birthDate: e.target.value })} />
          </div>

          <Button type="button" className="w-full" onClick={handleUpdateProfile} disabled={updateProfile.isPending}>
            {updateProfile.isPending ? <Loader2 size={16} className="animate-spin" /> : 'Simpan Perubahan'}
          </Button>
        </CardContent>
      </Card>

      <Button type="button" variant="ghost" className="w-full text-destructive" onClick={handleLogout}>
        <LogOut size={16} />
        Keluar
      </Button>
    </div>
  );
}
