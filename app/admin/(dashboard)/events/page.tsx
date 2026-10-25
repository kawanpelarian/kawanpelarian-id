// app/admin/(dashboard)/events/page.tsx
'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useAdminEvents, useDeleteEvent, useTogglePublishEvent, useToggleRegistration } from '@/hooks/use-admin-events';
import { getEventColumns, type AdminEventRow } from '@/components/admin/events-columns';
import { DataTable } from '@/components/admin/data-table';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { toast } from 'sonner';
import { useClientPagination } from '@/hooks/use-client-pagination';
import { TablePagination } from '@/components/admin/table-pagination';
import { SortDropdown, type SortOption } from '@/components/admin/sort-dropdown';
import { sortData } from '@/lib/sort-data';
import { ExtendCheckInDialog } from '@/components/admin/extend-check-in-dialog';

export default function AdminEventsPage() {
  const { data: events, isLoading, isFetching, refetch } = useAdminEvents();
  const deleteEvent = useDeleteEvent();
  const togglePublish = useTogglePublishEvent();
  const toggleRegistration = useToggleRegistration();
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [extendTarget, setExtendTarget] = useState<AdminEventRow | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  const sortedEvents = sortData(events ?? [], sortOption, {
    dateField: 'eventDate',
    nameField: 'name',
  });

  const { page, pageSize, total, paginatedData: paginatedEvents, handlePageChange, handlePageSizeChange } = useClientPagination(sortedEvents);

  const handleConfirmDelete = () => {
    if (!deleteTargetId) return;

    deleteEvent.mutate(deleteTargetId, {
      onSuccess: () => {
        toast.success('Event berhasil dihapus');
        setDeleteTargetId(null);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  const handleTogglePublish = (id: string) => {
    togglePublish.mutate(id, {
      onSuccess: (event) => {
        toast.success(event.isPublished ? 'Event dipublish' : 'Event di-unpublish');
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  const handleToggleRegistration = (id: string) => {
    toggleRegistration.mutate(id, {
      onSuccess: (event) => {
        toast.success(event.registrationClosed ? 'Pendaftaran ditutup' : 'Pendaftaran dibuka lagi');
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  const columns = getEventColumns({
    onDelete: setDeleteTargetId,
    onTogglePublish: handleTogglePublish,
    onToggleRegistration: handleToggleRegistration,
    onExtendCheckIn: setExtendTarget,
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-primaryBlack dark:text-primaryWhite">Event</h1>
          <p className="text-[15px] text-muted-foreground">Kelola event mingguan Kawan Pelarian</p>
        </div>

        <div className="flex items-center gap-2">
          <SortDropdown value={sortOption} onChange={setSortOption} />
          <Button render={<Link href="/admin/events/create" />} nativeButton={false}>
            <Plus size={16} />
            Buat Event
          </Button>
        </div>
      </div>

      <DataTable columns={columns} data={paginatedEvents} isLoading={isLoading} emptyMessage="Belum ada event, yuk buat event pertama!" />

      <TablePagination page={page} pageSize={pageSize} total={total} onPageChange={handlePageChange} onPageSizeChange={handlePageSizeChange} onRefresh={() => refetch()} isRefreshing={isFetching} />

      <ExtendCheckInDialog event={extendTarget} onOpenChange={(open) => !open && setExtendTarget(null)} />

      <AlertDialog open={!!deleteTargetId} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Event?</AlertDialogTitle>
            <AlertDialogDescription>Tindakan ini gak bisa dibatalkan. Semua data registrasi, rute, dan galeri yang terkait dengan event ini juga akan ikut terhapus.</AlertDialogDescription>
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
