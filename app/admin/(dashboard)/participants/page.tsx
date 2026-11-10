// app/admin/(dashboard)/participants/page.tsx
'use client';

import { useState } from 'react';
import { Download, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminEvents } from '@/hooks/use-admin-events';
import { useAdminParticipants, useUpdateAttendanceStatus, type ParticipantRow } from '@/hooks/use-admin-participants';
import { AttendanceStatusBadge } from '@/components/admin/attendance-status-badge';
import { PaymentProofDialog } from '@/components/admin/payment-proof-dialog';
import { Badge } from '@/components/ui/badge';
import { AddParticipantDialog } from '@/components/admin/add-participant-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { exportPaidParticipantsToExcel, exportPaidParticipantsToPDF } from '@/lib/export-participants';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useClientPagination } from '@/hooks/use-client-pagination';
import { TablePagination } from '@/components/admin/table-pagination';
import { SortDropdown, type SortOption } from '@/components/admin/sort-dropdown';
import { sortData } from '@/lib/sort-data';

const paymentOptions = [
  { value: '', label: 'Semua Pembayaran' },
  { value: 'PENDING', label: 'Menunggu Verifikasi' },
  { value: 'VERIFIED', label: 'Lunas' },
  { value: 'REJECTED', label: 'Ditolak' },
];

const paymentBadge = {
  PENDING: { label: 'Menunggu', variant: 'outline' as const },
  VERIFIED: { label: 'Lunas', variant: 'default' as const },
  REJECTED: { label: 'Ditolak', variant: 'destructive' as const },
};

const statusOptions = [
  { value: '', label: 'Semua Status' },
  { value: 'REGISTERED', label: 'Terdaftar' },
  { value: 'CHECKED_IN', label: 'Hadir' },
  { value: 'ABSENT', label: 'Tidak Hadir' },
];

export default function AdminParticipantsPage() {
  const { data: events } = useAdminEvents();
  const [selectedEventId, setSelectedEventId] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [proofRegistration, setProofRegistration] = useState<ParticipantRow | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  const { data, isLoading, isFetching, refetch } = useAdminParticipants(selectedEventId, appliedSearch, statusFilter, paymentFilter);
  const selectedEvent = events?.find((event) => event.id === selectedEventId);
  const isPaidEvent = (selectedEvent?.price ?? 0) > 0;
  const columnCount = isPaidEvent ? 7 : 6;
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (type: 'pdf' | 'excel') => {
    if (!selectedEvent) return;

    setIsExporting(true);
    try {
      const res = await fetch(`/api/admin/events/${selectedEvent.id}/participants?payment=VERIFIED`);
      if (!res.ok) throw new Error('Gagal memuat data peserta');
      const { registrations } = (await res.json()) as { registrations: ParticipantRow[] };

      if (registrations.length === 0) {
        toast.error('Belum ada peserta yang lunas');
        return;
      }

      const info = { name: selectedEvent.name, eventDate: selectedEvent.eventDate };

      if (type === 'pdf') await exportPaidParticipantsToPDF(registrations, info);
      else await exportPaidParticipantsToExcel(registrations, info);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Gagal export data');
    } finally {
      setIsExporting(false);
    }
  };
  const updateStatus = useUpdateAttendanceStatus();

  const sortedRegistrations = sortData(data?.registrations ?? [], sortOption, {
    dateField: 'registeredAt',
    nameField: (reg) => reg.member.name,
  });

  const { page, pageSize, total, paginatedData: paginatedRegistrations, handlePageChange, handlePageSizeChange } = useClientPagination(sortedRegistrations);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(searchInput);
  };

  const handleStatusChange = (registrationId: string, status: string) => {
    updateStatus.mutate(
      { registrationId, status: status as ParticipantRow['status'] },
      {
        onSuccess: () => toast.success('Status kehadiran diperbarui'),
        onError: (error) => toast.error(error.message),
      },
    );
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-primaryBlack dark:text-primaryWhite">Peserta</h1>
        <p className="text-[15px] text-muted-foreground">Kelola peserta yang terdaftar di tiap event</p>
      </div>

      <div className="flex items-end justify-between gap-4">
        <div className="w-full max-w-sm space-y-2">
          <Label htmlFor="event-select">Pilih Event</Label>
          <select id="event-select" value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm">
            <option value="">-- Pilih event --</option>
            {events?.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
        </div>

        {selectedEventId && (
          <div className="flex items-center gap-2">
            {isPaidEvent && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="outline" size="sm" disabled={isExporting}>
                      {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                      Export ke...
                    </Button>
                  }
                />
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExport('excel')}>Excel Lengkap (.xlsx)</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('pdf')}>PDF Nama Peserta</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <AddParticipantDialog eventId={selectedEventId} />
          </div>
        )}
      </div>

      {selectedEventId && (
        <>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2 rounded-xl border border-border px-4 py-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-7 w-12" />
                </div>
              ))}
            </div>
          ) : (
            data?.summary && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-xl border border-border px-4 py-3">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-semibold text-primaryBlack dark:text-primaryWhite">{data.summary.total}</p>
                </div>
                <div className="rounded-xl border border-border px-4 py-3">
                  <p className="text-sm text-muted-foreground">Terdaftar</p>
                  <p className="text-2xl font-semibold text-primaryBlack dark:text-primaryWhite">{data.summary.registered}</p>
                </div>
                <div className="rounded-xl border border-border px-4 py-3">
                  <p className="text-sm text-muted-foreground">Hadir</p>
                  <p className="text-2xl font-semibold text-primaryBlack dark:text-primaryWhite">{data.summary.checkedIn}</p>
                </div>
                <div className="rounded-xl border border-border px-4 py-3">
                  <p className="text-sm text-muted-foreground">Tidak Hadir</p>
                  <p className="text-2xl font-semibold text-primaryBlack dark:text-primaryWhite">{data.summary.absent}</p>
                </div>
                {isPaidEvent && (
                  <>
                    <div className="rounded-xl border border-border px-4 py-3">
                      <p className="text-sm text-muted-foreground">Menunggu Verifikasi</p>
                      <p className="text-2xl font-semibold text-primaryBlack dark:text-primaryWhite">{data.summary.pendingPayment}</p>
                    </div>
                    <div className="rounded-xl border border-border px-4 py-3">
                      <p className="text-sm text-muted-foreground">Terkumpul</p>
                      <p className="text-2xl font-semibold text-primaryBlack dark:text-primaryWhite">Rp{data.summary.revenue.toLocaleString('id-ID')}</p>
                    </div>
                  </>
                )}
              </div>
            )
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <form onSubmit={handleSearchSubmit} className="flex flex-1 gap-2">
              <Input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Cari nama atau email peserta..." />
              <Button type="submit" variant="outline">
                <Search size={16} />
              </Button>
            </form>

            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm sm:w-48">
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {isPaidEvent && (
              <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm sm:w-52">
                {paymentOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}

            <SortDropdown value={sortOption} onChange={setSortOption} />
          </div>

          <div className="rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>No. HP</TableHead>
                  <TableHead>Tanggal Daftar</TableHead>
                  {isPaidEvent && <TableHead>Pembayaran</TableHead>}
                  <TableHead>Status</TableHead>
                  <TableHead>Ubah Status</TableHead>
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
                        <Skeleton className="h-5 w-20" />
                      </TableCell>
                      {isPaidEvent && (
                        <TableCell>
                          <Skeleton className="h-5 w-16" />
                        </TableCell>
                      )}
                      <TableCell>
                        <Skeleton className="h-5 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-24" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : paginatedRegistrations.length ? (
                  paginatedRegistrations.map((reg) => (
                    <TableRow key={reg.id}>
                      <TableCell className="font-medium text-primaryBlack dark:text-primaryWhite">{reg.member.name}</TableCell>
                      <TableCell>{reg.member.email}</TableCell>
                      <TableCell>{reg.member.phone}</TableCell>
                      <TableCell>
                        {new Date(reg.registeredAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </TableCell>
                      {isPaidEvent && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant={paymentBadge[reg.paymentStatus].variant}>{paymentBadge[reg.paymentStatus].label}</Badge>
                            {reg.proofUrl && (
                              <Button type="button" variant="outline" size="sm" onClick={() => setProofRegistration(reg)}>
                                Cek Bukti
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                      <TableCell>
                        <AttendanceStatusBadge status={reg.status} />
                      </TableCell>
                      <TableCell>
                        <select value={reg.status} onChange={(e) => handleStatusChange(reg.id, e.target.value)} className="flex h-8 rounded-md border border-input bg-background px-2 text-sm shadow-sm">
                          <option value="REGISTERED">Terdaftar</option>
                          <option value="CHECKED_IN">Hadir</option>
                          <option value="ABSENT">Tidak Hadir</option>
                        </select>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columnCount} className="h-24 text-center text-muted-foreground">
                      Belum ada peserta yang terdaftar
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <PaymentProofDialog registration={proofRegistration} onClose={() => setProofRegistration(null)} />

          <TablePagination page={page} pageSize={pageSize} total={total} onPageChange={handlePageChange} onPageSizeChange={handlePageSizeChange} onRefresh={() => refetch()} isRefreshing={isFetching} />
        </>
      )}
    </div>
  );
}
