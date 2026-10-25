'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Pencil, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateMember, type MemberListRow } from '@/hooks/use-admin-members-list';

interface EditMemberDialogProps {
  member: MemberListRow;
}

export function EditMemberDialog({ member }: EditMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: member.name,
    email: member.email,
    phone: member.phone,
  });

  const updateMember = useUpdateMember();

  useEffect(() => {
    if (open) {
      setForm({ name: member.name, email: member.email, phone: member.phone });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSubmit = () => {
    updateMember.mutate(
      { id: member.id, ...form },
      {
        onSuccess: () => {
          toast.success('Data member berhasil diperbarui');
          setOpen(false);
        },
        onError: (error) => toast.error(error.message),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon" />}>
        <Pencil size={14} />
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Data Member</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nama Lengkap</Label>
            <Input id="edit-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-email">Email</Label>
            <Input id="edit-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-phone">Nomor HP / WhatsApp</Label>
            <Input id="edit-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>

          <Button type="button" className="w-full" onClick={handleSubmit} disabled={updateMember.isPending}>
            {updateMember.isPending ? <Loader2 size={16} className="animate-spin" /> : 'Simpan Perubahan'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
