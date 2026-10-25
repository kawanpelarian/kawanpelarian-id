'use client';

import { Fragment } from 'react';
import { usePathname } from 'next/navigation';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

// Label ramah-manusia buat tiap segment path, sesuai struktur route admin kita
const segmentLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  events: 'Event',
  create: 'Buat Event',
  edit: 'Edit Event',
  participants: 'Peserta',
  members: 'Member',
  gallery: 'Galeri',
};

// Pola CUID/CUID2 dari Prisma @default(cuid()) -> segment ini gak usah ditampilkan mentah
const idPattern = /^c[a-z0-9]{20,}$/i;

interface BreadcrumbEntry {
  label: string;
  href: string;
}

function buildBreadcrumbs(pathname: string): BreadcrumbEntry[] {
  const segments = pathname
    .split('/')
    .filter(Boolean)
    .filter((s) => s !== 'admin');

  const entries: BreadcrumbEntry[] = [];
  let currentPath = '/admin';

  segments.forEach((segment) => {
    currentPath += `/${segment}`;

    // Segment ID (cuid) di-skip, biar breadcrumb gak nampilin string acak
    if (idPattern.test(segment)) return;

    const label = segmentLabels[segment] ?? segment;
    entries.push({ label, href: currentPath });
  });

  return entries;
}

export function AdminBreadcrumb() {
  const pathname = usePathname();
  const entries = buildBreadcrumbs(pathname);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/admin/dashboard">Admin</BreadcrumbLink>
        </BreadcrumbItem>

        {entries.map((entry, index) => {
          const isLast = index === entries.length - 1;
          return (
            <Fragment key={entry.href}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>{isLast ? <BreadcrumbPage>{entry.label}</BreadcrumbPage> : <BreadcrumbLink href={entry.href}>{entry.label}</BreadcrumbLink>}</BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
