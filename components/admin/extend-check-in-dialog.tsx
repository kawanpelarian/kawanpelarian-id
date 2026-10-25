// components/admin/extend-check-in-dialog.tsx
'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getCheckInWindow } from '@/lib/check-in-window';
import { useExtendCheckIn, type ExtendCheckInPayload } from '@/hooks/use-admin-events';
import type { AdminEventRow } from '@/components/admin/events-columns';

interface ExtendCheckInDialogProps {
  event: AdminEventRow | null;
  onOpenChange: (open: boolean) => void;
}

const PRESETS = [
  { label: '+30 mnt', minutes: 30 },
  { label: '+1 jam', minutes: 60 },
  { label: '+2 jam', minutes: 120 },
  { label: '+3 jam', minutes: 180 },
];

function formatWib(date: Date): string {
  return date.toLocaleString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  });
}

export function ExtendCheckInDialog({ event, onOpenChange }: ExtendCheckInDialogProps) {
  const [customUntil, setCustomUntil] = useState('');
  const extend = useExtendCheckIn();

  useEffect(() => {
    setCustomUntil('');
  }, [event?.id]);

  if (!event) return null;

  const { closesAt } = getCheckInWindow(event);

  const submit = (payload: ExtendCheckInPayload) => {
    extend.mutate(
      { id: event.id, payload },
      {
        onSuccess: (res) => {
          toast.success(res.message);
          onOpenChange(false);
        },
        onError: (error) => toast.error(error.message),
      },
    );
  };

  const handleCustom = () => {
    if (!customUntil) {
      toast.error('Pilih tanggal dan jam dulu');
      return;
    }
    // Input datetime-local tanpa zona, anggap WIB
    submit({ until: new Date(`${customUntil}:00+07:00`).toISOString() });
  };

  return (
    <Dialog open={!!event} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Perpanjang Check-in</DialogTitle>
          <DialogDescription>{event.name}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="rounded-lg bg-muted px-4 py-3 text-sm">
            <p className="text-muted-foreground">Check-in ditutup pada</p>
            <p className="font-semibold">{formatWib(closesAt)} WIB</p>
            {event.checkInUntil && <p className="mt-1 text-xs text-muted-foreground">Sudah diperpanjang</p>}
          </div>

          <div className="space-y-2">
            <Label>Tambah waktu</Label>
            <div className="grid grid-cols-4 gap-2">
              {PRESETS.map((preset) => (
                <Button key={preset.minutes} type="button" variant="outline" disabled={extend.isPending} onClick={() => submit({ addMinutes: preset.minutes })}>
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-until">Atau tentukan sendiri (WIB)</Label>
            <div className="flex gap-2">
              <Input id="custom-until" type="datetime-local" value={customUntil} onChange={(e) => setCustomUntil(e.target.value)} />
              <Button type="button" onClick={handleCustom} disabled={extend.isPending}>
                {extend.isPending ? <Loader2 size={16} className="animate-spin" /> : 'Atur'}
              </Button>
            </div>
          </div>

          {event.checkInUntil && (
            <Button type="button" variant="ghost" className="w-full text-muted-foreground" disabled={extend.isPending} onClick={() => submit({ reset: true })}>
              Kembalikan ke default (jam mulai + 2 jam)
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
