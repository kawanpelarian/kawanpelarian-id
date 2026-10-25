// components/member/public-profile-card.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useProfile } from '@/hooks/use-profile';
import { usePublicProfileSettings, useSavePublicProfile, useUploadAvatar, useRemoveAvatar } from '@/hooks/use-public-profile';
import { SOCIALS, normalizeStravaUrl } from '@/lib/social-links';
import { STRAVA_ERROR } from '@/schemas/public-profile.schema';
import { toTitleCase } from '@/lib/format-name';
import { MemberAvatar } from '@/components/member/member-avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const BIO_MAX = 160;

export function PublicProfileCard() {
  const { data: account } = useProfile();
  const { data: settings, isLoading } = usePublicProfileSettings();
  const save = useSavePublicProfile();
  const upload = useUploadAvatar();
  const remove = useRemoveAvatar();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    bio: '',
    instagram: '',
    strava: '',
    tiktok: '',
    isProfileHidden: false,
  });

  useEffect(() => {
    if (settings) {
      setForm({
        bio: settings.bio ?? '',
        instagram: settings.instagram ?? '',
        strava: settings.strava ?? '',
        tiktok: settings.tiktok ?? '',
        isProfileHidden: settings.isProfileHidden,
      });
    }
  }, [settings]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    upload.mutate(file, {
      onSuccess: () => toast.success('Foto profil diperbarui'),
      onError: (error) => toast.error(error.message),
    });
  };

  const stravaInvalid = normalizeStravaUrl(form.strava) === null;

  const handleSave = () => {
    if (stravaInvalid) {
      toast.error(STRAVA_ERROR);
      return;
    }

    save.mutate(form, {
      onSuccess: () => toast.success('Profil publik disimpan'),
      onError: (error) => toast.error(error.message),
    });
  };

  if (isLoading) return <Skeleton className="h-96 w-full rounded-xl" />;

  const name = toTitleCase(account?.name ?? 'Member');
  const busy = upload.isPending || remove.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Profil Publik</CardTitle>
        <p className="text-sm text-muted-foreground">Yang tampil ke sesama member: foto, nama, bio, lencana, riwayat event yang kamu hadiri, dan link sosial. Email, nomor HP, dan tanggal lahir tidak pernah ditampilkan.</p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center gap-4">
          <MemberAvatar name={name} avatarUrl={settings?.avatarUrl} size="lg" />
          <div className="flex flex-col gap-2">
            <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => fileRef.current?.click()}>
              {upload.isPending ? <Loader2 size={14} className="animate-spin" /> : 'Ganti Foto'}
            </Button>
            {settings?.avatarUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive"
                disabled={busy}
                onClick={() =>
                  remove.mutate(undefined, {
                    onSuccess: () => toast.success('Foto dihapus'),
                    onError: (error) => toast.error(error.message),
                  })
                }
              >
                Hapus Foto
              </Button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="bio">Bio</Label>
            <span className="text-xs text-muted-foreground">
              {form.bio.length}/{BIO_MAX}
            </span>
          </div>
          <textarea
            id="bio"
            rows={3}
            maxLength={BIO_MAX}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="Ceritakan sedikit tentang kamu dan larimu"
            className="w-full resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          />
        </div>

        {SOCIALS.map((social) => (
          <div key={social.key} className="space-y-2">
            <Label htmlFor={social.key}>{social.label}</Label>
            <Input
              id={social.key}
              value={form[social.key]}
              onChange={(e) => setForm({ ...form, [social.key]: e.target.value })}
              placeholder={social.placeholder}
              autoCapitalize="none"
              autoCorrect="off"
              aria-invalid={social.key === 'strava' && stravaInvalid}
            />
            {social.key === 'strava' && stravaInvalid && <p className="text-xs text-destructive">{STRAVA_ERROR}</p>}
          </div>
        ))}

        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3">
          <input type="checkbox" className="mt-0.5 h-4 w-4 accent-brandNavy" checked={form.isProfileHidden} onChange={(e) => setForm({ ...form, isProfileHidden: e.target.checked })} />
          <span className="space-y-0.5">
            <span className="block text-sm font-medium">Sembunyikan profil saya</span>
            <span className="block text-xs text-muted-foreground">Profilmu tidak muncul di daftar member dan tidak bisa dibuka member lain.</span>
          </span>
        </label>

        <div className="flex gap-2">
          <Button type="button" className="flex-1" onClick={handleSave} disabled={save.isPending || stravaInvalid}>
            {save.isPending ? <Loader2 size={16} className="animate-spin" /> : 'Simpan Profil Publik'}
          </Button>
          {account?.id && (
            <Button type="button" variant="outline" render={<Link href={`/members/${account.id}`} />} nativeButton={false}>
              Lihat
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
