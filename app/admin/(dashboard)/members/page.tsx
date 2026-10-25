'use client';

import { useMemo, useState } from 'react';
import { Search, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminMembersList, useDeleteMember } from '@/hooks/use-admin-members-list';
import { useClientPagination } from '@/hooks/use-client-pagination';
import { TablePagination } from '@/components/admin/table-pagination';
import { SortDropdown, type SortOption } from '@/components/admin/sort-dropdown';
import { sortData } from '@/lib/sort-data';
import { EditMemberDialog } from '@/components/admin/edit-member-dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function AdminMembersPage() {
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  const { data: members, isLoading, isFetching, refetch } = useAdminMembersList(appliedSearch);
  const deleteMember = useDeleteMember();

  const sortedMembers = sortData(members ?? [], sortOption, {
    dateField: 'createdAt',
    nameField: 'name',
  });

  const { page, pageSize, total, paginatedData: paginatedMembers, handlePageChange, handlePageSizeChange } = useClientPagination(sortedMembers);

  // Nama yang muncul lebih dari sekali ditandain, biar admin gampang ngecek
  // manual mana yang mungkin akun ganda/mencurigakan (email tetap unik di DB)
  const duplicateNames = useMemo(() => {
    if (!members) return new Set<string>();
    const counts = new Map<string, number>();
    members.forEach((m) => {
      const key = m.name.trim().toLowerCase();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return new Set([...counts.entries()].filter(([, count]) => count > 1).map(([name]) => name));
  }, [members]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(searchInput);
  };

  const handleConfirmDelete = () => {
    if (!deleteTargetId) return;

    deleteMember.mutate(deleteTargetId, {
      onSuccess: () => {
        toast.success('Member berhasil dihapus');
        setDeleteTargetId(null);
      },
      onError: (error) => {
        toast.error(error.message);
        setDeleteTargetId(null);
      },
    });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-primaryBlack dark:text-primaryWhite">Member</h1>
        <p className="text-[15px] text-muted-foreground">Semua member yang terdaftar di Kawan Pelarian</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex max-w-sm flex-1 gap-2">
          <Input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Cari nama, email, atau no. HP..." />
          <Button type="submit" variant="outline">
            <Search size={16} />
          </Button>
        </form>

        <SortDropdown value={sortOption} onChange={setSortOption} />
      </div>

      <div className="rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>No. HP</TableHead>
              <TableHead>Tanggal Lahir</TableHead>
              <TableHead>Bergabung</TableHead>
              <TableHead>Total Event</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-10" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8" />
                  </TableCell>
                </TableRow>
              ))
            ) : paginatedMembers.length ? (
              paginatedMembers.map((member) => {
                const isDuplicateName = duplicateNames.has(member.name.trim().toLowerCase());
                return (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium text-primaryBlack dark:text-primaryWhite">
                      <div className="flex items-center gap-2">
                        {member.name}
                        {isDuplicateName && (
                          <Badge variant="outline" className="gap-1 text-amber-600 dark:text-amber-500">
                            <AlertTriangle size={11} />
                            Nama Sama
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{member.phone}</TableCell>
                    <TableCell>
                      {member.birthDate ? (
                        new Date(member.birthDate).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(member.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>{member._count.registrations}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <EditMemberDialog member={member} />
                        <Button variant="ghost" size="icon" onClick={() => setDeleteTargetId(member.id)}>
                          <Trash2 size={14} className="text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Belum ada member terdaftar
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination page={page} pageSize={pageSize} total={total} onPageChange={handlePageChange} onPageSizeChange={handlePageSizeChange} onRefresh={() => refetch()} isRefreshing={isFetching} />

      <AlertDialog open={!!deleteTargetId} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Member?</AlertDialogTitle>
            <AlertDialogDescription>Tindakan ini gak bisa dibatalkan. Semua riwayat registrasi dan kehadiran member ini di seluruh event juga akan ikut terhapus.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
