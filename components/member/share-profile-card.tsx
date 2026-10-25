// components/member/share-profile-card.tsx
'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Download, Eye, Link2, Loader2, RefreshCw, Share2 } from 'lucide-react';
import { useProfileShare, useUpdateProfileShare } from '@/hooks/use-profile-share';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ShareProfileCard() {
  const { data, isLoading } = useProfileShare();
  const update = useUpdateProfileShare();

  const shareCode = data?.shareCode ?? null;
  const active = !!data?.isSharingEnabled && !!shareCode;

  // Kartu dirender sekali, dipakai untuk pratinjau sekaligus unduhan.
  const [cardUrl, setCardUrl] = useState<string | null>(null);
  const [cardFailed, setCardFailed] = useState(false);

  useEffect(() => {
    if (!active || !shareCode) return;
    let objectUrl: string | null = null;
    let cancelled = false;
    setCardUrl(null);
    setCardFailed(false);
    fetch(`/p/${shareCode}/card`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setCardUrl(objectUrl);
      })
      .catch(() => !cancelled && setCardFailed(true));
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [active, shareCode]);

  if (isLoading || !data) return <Skeleton className="h-56 w-full rounded-xl" />;

  const { isSharingEnabled, shareUrl } = data;
  const caption = `Lihat profil lariku di Kawan Pelarian 🏃 ${shareUrl}`;

  const run = (action: 'enable' | 'disable' | 'regenerate', message: string) =>
    update.mutate(action, {
      onSuccess: () => toast.success(message),
      onError: (error) => toast.error(error.message),
    });

  const copy = async (text: string, message: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(message);
    } catch {
      toast.error('Gagal menyalin, salin manual ya');
    }
  };

  const handleShare = async () => {
    if (!shareUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Profil Kawan Pelarian', text: 'Lihat profil lariku', url: shareUrl });
        return;
      } catch {
        return;
      }
    }
    copy(caption, 'Teks dan link disalin');
  };

  const handleDownload = () => {
    if (!cardUrl) return;
    const link = document.createElement('a');
    link.href = cardUrl;
    link.download = 'kartu-kawan-pelarian.png';
    link.click();
  };

  const handleRegenerate = () => {
    if (!window.confirm('Link lama akan berhenti berfungsi. Buat link baru?')) return;
    run('regenerate', 'Link baru dibuat');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Bagikan Profil</CardTitle>
        <p className="text-sm text-muted-foreground">Buat link publik supaya profilmu bisa dilihat siapa saja yang punya link-nya, misalnya lewat Instagram Story. Profilmu tidak muncul di pencarian Google.</p>
      </CardHeader>
      <CardContent className="space-y-5">
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3">
          <input type="checkbox" className="mt-0.5 h-4 w-4 accent-brandNavy" checked={active} disabled={update.isPending} onChange={() => (active ? run('disable', 'Link profil dimatikan') : run('enable', 'Link profil diaktifkan'))} />
          <span className="space-y-0.5">
            <span className="block text-sm font-medium">Aktifkan link publik</span>
            <span className="block text-xs text-muted-foreground">Yang tampil: nama lengkap, foto, bio, lencana, jumlah lari bareng, dan link sosial.</span>
          </span>
        </label>

        {active && (
          <>
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1 truncate rounded-lg border border-border bg-muted px-3 py-2 text-sm">{shareUrl}</div>
              <Button type="button" variant="outline" size="icon" onClick={() => copy(shareUrl!, 'Link disalin')}>
                <Link2 size={16} />
              </Button>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm">
              <Eye size={16} className="text-muted-foreground" />
              <span className="font-medium">{data.views}</span>
              <span className="text-muted-foreground">dilihat</span>
              <span className="ml-auto text-xs text-muted-foreground">{data.viewsLast7Days} dalam 7 hari terakhir</span>
            </div>

            <div className="flex gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {cardUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cardUrl} alt="Pratinjau kartu profil" className="aspect-9/16 w-24 shrink-0 rounded-lg border border-border bg-muted object-cover" />
              ) : (
                <div className="flex aspect-9/16 w-24 shrink-0 animate-pulse items-center justify-center rounded-lg border border-border bg-muted">
                  {cardFailed ? <span className="px-2 text-center text-[10px] text-muted-foreground">Gagal memuat</span> : <Loader2 size={16} className="animate-spin text-muted-foreground" />}
                </div>
              )}
              <div className="flex flex-1 flex-col gap-2">
                <Button type="button" size="sm" onClick={handleDownload} disabled={!cardUrl}>
                  {!cardUrl && !cardFailed ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                  Unduh Kartu Story
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={handleShare}>
                  <Share2 size={14} />
                  Bagikan
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => copy(caption, 'Teks ajakan disalin')}>
                  Salin Teks Ajakan
                </Button>
                <p className="text-xs text-muted-foreground">Di Instagram, tempel link lewat stiker Link di Story.</p>
              </div>
            </div>

            <Button type="button" variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={handleRegenerate} disabled={update.isPending}>
              <RefreshCw size={14} />
              Buat link baru
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
