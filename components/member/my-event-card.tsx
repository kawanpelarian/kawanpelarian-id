// components/member/my-event-card.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Clock, Loader2, ChevronRight, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useScanAccess } from '@/hooks/use-scan';
import { CheckInQr } from '@/components/member/check-in-qr';
import type { MyRegistration } from '@/hooks/use-my-events';

interface MyEventCardProps {
  registration: MyRegistration;
  onCancel?: (registrationId: string) => void;
  onCheckIn?: (eventId: string) => void;
  isCheckingIn?: boolean;
  isCancelling?: boolean;
}

const statusConfig = {
  REGISTERED: { label: 'Terdaftar', variant: 'secondary' as const },
  CHECKED_IN: { label: 'Hadir', variant: 'default' as const },
  ABSENT: { label: 'Tidak Hadir', variant: 'outline' as const },
};

export function MyEventCard({ registration, onCancel, onCheckIn, isCheckingIn, isCancelling }: MyEventCardProps) {
  const { event, status } = registration;
  // Status check-in dihitung di server (lib/check-in-window.ts) supaya
  // konsisten dengan validasi saat check-in, tidak tergantung jam perangkat
  const { data: isStaff } = useScanAccess();
  const canCheckIn = registration.checkInOpen;
  const isPaid = event.price > 0;
  const paymentStatus = registration.paymentStatus;
  const paymentLocked = isPaid && paymentStatus === 'VERIFIED';
  const canCancel = status === 'REGISTERED' && !registration.started && !paymentLocked;
  const extendedUntilLabel =
    canCheckIn && event.checkInUntil
      ? new Date(event.checkInUntil).toLocaleString('id-ID', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Asia/Jakarta',
        })
      : null;
  const config =
    isPaid && paymentStatus === 'PENDING' ? { label: 'Menunggu Verifikasi', variant: 'outline' as const } : isPaid && paymentStatus === 'REJECTED' ? { label: 'Pembayaran Ditolak', variant: 'destructive' as const } : statusConfig[status];
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="relative aspect-square w-full bg-muted">
        {event.coverImageUrl ? <Image src={event.coverImageUrl} alt={event.name} fill className="object-cover" /> : null}
        <Badge variant={config.variant} className="absolute left-2 top-2">
          {config.label}
        </Badge>
      </div>

      <div className="space-y-2 p-4">
        <h3 className="font-semibold text-primaryBlack dark:text-primaryWhite">{event.name}</h3>

        <div className="space-y-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock size={14} />
            <span>
              {new Date(event.eventDate).toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
              , {event.eventTime}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} />
            <span>{event.meetingPoint}</span>
          </div>
        </div>

        <Button type="button" variant="outline" className="mt-2 w-full" render={<Link href={`/events/${event.slug}`} />} nativeButton={false}>
          Lihat Detail
          <ChevronRight size={16} />
        </Button>

        {isPaid && paymentStatus === 'REJECTED' && <p className="text-xs text-destructive">Bukti transfer ditolak, buka detail event untuk upload ulang.</p>}

        {extendedUntilLabel && <p className="text-xs text-muted-foreground">Check-in dibuka sampai {extendedUntilLabel} WIB</p>}

        {canCheckIn && registration.checkInToken && !isStaff && <CheckInQr token={registration.checkInToken} eventName={event.name} />}

        {canCheckIn && isStaff && onCheckIn && (
          <Button type="button" className="w-full" onClick={() => onCheckIn(event.id)} disabled={isCheckingIn}>
            {isCheckingIn ? <Loader2 size={16} className="animate-spin" /> : 'Check-in Sekarang (Panitia)'}
          </Button>
        )}

        {canCancel && onCancel && (
          <Button type="button" variant="outline" className="w-full text-destructive hover:text-destructive" onClick={() => setShowCancelConfirm(true)} disabled={isCancelling}>
            {isCancelling ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <XCircle size={16} />
                Batalkan Pendaftaran
              </>
            )}
          </Button>
        )}
      </div>

      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Batalkan Pendaftaran?</AlertDialogTitle>
            <AlertDialogDescription>
              Kamu bakal dikeluarin dari daftar peserta <strong>{event.name}</strong>. Kalau berubah pikiran, kamu bisa daftar lagi selama kuota masih ada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onCancel?.(registration.id);
                setShowCancelConfirm(false);
              }}
            >
              Ya, Batalkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
