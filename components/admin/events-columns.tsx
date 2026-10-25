// components/admin/events-columns.tsx
'use client';

import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import Image from 'next/image';
import { MoreHorizontal, Pencil, Trash2, Eye, EyeOff, Lock, LockOpen, Timer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export interface AdminEventRow {
  id: string;
  name: string;
  slug: string;
  coverImageUrl: string | null;
  eventDate: string;
  eventTime: string;
  checkInUntil: string | null;
  quota: number;
  isPublished: boolean;
  registrationClosed: boolean;
  _count: { registrations: number };
}

interface ColumnsActions {
  onDelete: (id: string) => void;
  onTogglePublish: (id: string) => void;
  onToggleRegistration: (id: string) => void;
  onExtendCheckIn: (event: AdminEventRow) => void;
}

export function getEventColumns({ onDelete, onTogglePublish, onToggleRegistration, onExtendCheckIn }: ColumnsActions): ColumnDef<AdminEventRow>[] {
  return [
    {
      accessorKey: 'coverImageUrl',
      header: 'Cover',
      cell: ({ row }) => {
        const cover = row.original.coverImageUrl;
        return <div className="h-12 w-16 overflow-hidden rounded-md bg-muted">{cover ? <Image src={cover} alt={row.original.name} width={64} height={48} className="h-full w-full object-cover" /> : null}</div>;
      },
    },
    {
      accessorKey: 'name',
      header: 'Nama Event',
      cell: ({ row }) => <span className="font-medium text-primaryBlack dark:text-primaryWhite">{row.original.name}</span>,
    },
    {
      accessorKey: 'eventDate',
      header: 'Tanggal',
      cell: ({ row }) =>
        new Date(row.original.eventDate).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
    },
    {
      accessorKey: '_count.registrations',
      header: 'Pendaftar',
      cell: ({ row }) => `${row.original._count.registrations}/${row.original.quota}`,
    },
    {
      accessorKey: 'isPublished',
      header: 'Status',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <Badge variant={row.original.isPublished ? 'default' : 'secondary'}>{row.original.isPublished ? 'Published' : 'Draft'}</Badge>
          {row.original.registrationClosed && (
            <Badge variant="outline" className="gap-1 text-amber-600 dark:text-amber-500">
              <Lock size={10} />
              Pendaftaran Ditutup
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => {
        const event = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon">
                  <MoreHorizontal size={16} />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                render={
                  <Link href={`/admin/events/${event.id}/edit`}>
                    <Pencil size={14} />
                    Edit
                  </Link>
                }
              />
              <DropdownMenuItem onClick={() => onTogglePublish(event.id)}>
                {event.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
                {event.isPublished ? 'Unpublish' : 'Publish'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleRegistration(event.id)}>
                {event.registrationClosed ? <LockOpen size={14} /> : <Lock size={14} />}
                {event.registrationClosed ? 'Buka Pendaftaran' : 'Tutup Pendaftaran'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExtendCheckIn(event)}>
                <Timer size={14} />
                Perpanjang Check-in
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(event.id)}>
                <Trash2 size={14} />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
