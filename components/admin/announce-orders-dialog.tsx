// components/admin/announce-orders-dialog.tsx
'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Megaphone } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const DEFAULT_MESSAGE = 'Karena kamu sudah memesan jersey Kawan Pelarian, kehadiranmu di event ini wajib ya. Kalau berhalangan, kabari admin lewat Instagram secepatnya.';

interface AnnounceOrdersDialogProps {
  batch?: number;
  batchLabel?: string;
}

export function AnnounceOrdersDialog({ batch, batchLabel }: AnnounceOrdersDialogProps) {
  const [open, setOpen] = useState(false);
  const [eventName, setEventName] = useState('');
  const [eventInfo, setEventInfo] = useState('');
  const [message, setMessage] = useState(DEFAULT_MESSAGE);

  const { data: recipientCount, isLoading: isLoadingCount } = useQuery({
    queryKey: ['announce-recipients', batch],
    enabled: open,
    queryFn: async () => {
      const res = await fetch(`/api/admin/orders/announce${batch ? `?batch=${batch}` : ''}`);
      if (!res.ok) throw new Error('Gagal memuat jumlah penerima');
      const data = await res.json();
      return data.recipients as number;
    },
  });

  const send = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/admin/orders/announce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch, eventName, eventInfo: eventInfo || undefined, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Gagal mengirim pengumuman');
      return data as { sent: number; failed: number };
    },
    onSuccess: ({ sent, failed }) => {
      if (failed > 0) toast.warning(`${sent} email terkirim, ${failed} gagal`);
      else toast.success(`${sent} email berhasil dikirim`);
      setOpen(false);
    },
    onError: (error) => toast.error(error.message),
  });

  const canSend = !!eventName.trim() && !!message.trim() && !!recipientCount && !send.isPending;

  const handleSend = () => {
    if (!window.confirm(`Kirim email ke ${recipientCount} pemesan? Email tidak bisa ditarik kembali.`)) return;
    send.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <Megaphone size={14} />
            Kirim Pengumuman
          </Button>
        }
      />
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Kirim Pengumuman ke Pemesan</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{isLoadingCount ? 'Menghitung penerima...' : `Dikirim ke ${recipientCount ?? 0} pemesan${batchLabel ? ` (${batchLabel})` : ''}, tidak termasuk pesanan yang ditolak.`}</p>

          <div className="space-y-2">
            <Label htmlFor="announce-event">Nama event</Label>
            <Input id="announce-event" value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="Kawan Pelarian Vol. 2" maxLength={100} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="announce-info">Waktu dan tempat (opsional)</Label>
            <Input id="announce-info" value={eventInfo} onChange={(e) => setEventInfo(e.target.value)} placeholder="Minggu, 16 November 2026, 06.00 WIB" maxLength={200} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="announce-message">Pesan</Label>
            <Textarea id="announce-message" value={message} onChange={(e) => setMessage(e.target.value)} rows={5} maxLength={1000} />
          </div>

          <Button type="button" className="w-full" onClick={handleSend} disabled={!canSend}>
            {send.isPending ? <Loader2 size={16} className="animate-spin" /> : `Kirim ke ${recipientCount ?? 0} pemesan`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
