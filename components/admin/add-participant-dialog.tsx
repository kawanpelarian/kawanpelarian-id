'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Search, UserPlus, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSearchMembers, useQuickCreateMember, useManualRegisterMember } from '@/hooks/use-admin-members';

interface AddParticipantDialogProps {
  eventId: string;
}

export function AddParticipantDialog({ eventId }: AddParticipantDialogProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'search' | 'create'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [newMember, setNewMember] = useState({ name: '', email: '', phone: '' });

  const { data: searchResults, isLoading: isSearching } = useSearchMembers(searchQuery);
  const quickCreateMember = useQuickCreateMember();
  const manualRegister = useManualRegisterMember();

  const resetAndClose = () => {
    setSearchQuery('');
    setNewMember({ name: '', email: '', phone: '' });
    setMode('search');
    setOpen(false);
  };

  const handleRegisterExisting = (memberId: string) => {
    manualRegister.mutate(
      { eventId, memberId },
      {
        onSuccess: () => {
          toast.success('Peserta berhasil didaftarkan');
          resetAndClose();
        },
        onError: (error) => toast.error(error.message),
      },
    );
  };

  const handleCreateAndRegister = () => {
    quickCreateMember.mutate(newMember, {
      onSuccess: (member) => {
        manualRegister.mutate(
          { eventId, memberId: member.id },
          {
            onSuccess: () => {
              toast.success(`${member.name} berhasil dibuat & didaftarkan`);
              resetAndClose();
            },
            onError: (error) => toast.error(error.message),
          },
        );
      },
      onError: (error) => toast.error(error.message),
    });
  };

  const isProcessing = quickCreateMember.isPending || manualRegister.isPending;

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : resetAndClose())}>
      <DialogTrigger render={<Button />}>
        <UserPlus size={16} />
        Tambah Peserta
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Peserta Manual</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 rounded-lg bg-muted p-1">
          <button
            type="button"
            onClick={() => setMode('search')}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm transition-colors ${mode === 'search' ? 'bg-background font-medium text-primaryBlack shadow-sm dark:text-primaryWhite' : 'text-muted-foreground'}`}
          >
            Cari Member
          </button>
          <button
            type="button"
            onClick={() => setMode('create')}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm transition-colors ${mode === 'create' ? 'bg-background font-medium text-primaryBlack shadow-sm dark:text-primaryWhite' : 'text-muted-foreground'}`}
          >
            Buat Baru
          </button>
        </div>

        {mode === 'search' ? (
          <div className="space-y-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari nama, email, atau no. HP..." className="pl-9" />
            </div>

            <div className="max-h-64 space-y-1 overflow-y-auto">
              {isSearching && <p className="py-4 text-center text-sm text-muted-foreground">Mencari...</p>}

              {!isSearching && searchQuery.trim().length >= 2 && searchResults?.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">Gak ketemu. Coba tab &quot;Buat Baru&quot;.</p>}

              {searchResults?.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => handleRegisterExisting(member.id)}
                  disabled={isProcessing}
                  className="flex w-full flex-col items-start rounded-lg border border-border px-3 py-2 text-left transition-colors hover:bg-accent disabled:opacity-50"
                >
                  <span className="font-medium text-primaryBlack dark:text-primaryWhite">{member.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {member.email} &middot; {member.phone}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-name">Nama Lengkap</Label>
              <Input id="new-name" value={newMember.name} onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} placeholder="Nama lengkap peserta" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-email">Email</Label>
              <Input id="new-email" type="email" value={newMember.email} onChange={(e) => setNewMember({ ...newMember, email: e.target.value })} placeholder="email@contoh.com" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-phone">Nomor HP / WhatsApp</Label>
              <Input id="new-phone" value={newMember.phone} onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })} placeholder="08xxxxxxxxxx" />
            </div>

            <Button type="button" className="w-full" onClick={handleCreateAndRegister} disabled={isProcessing || !newMember.name || !newMember.email || !newMember.phone}>
              {isProcessing ? <Loader2 size={16} className="animate-spin" /> : 'Buat & Daftarkan'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
