// components/admin/attendance-status-badge.tsx
import { Badge } from '@/components/ui/badge';

const statusConfig = {
  REGISTERED: { label: 'Terdaftar', variant: 'secondary' as const },
  CHECKED_IN: { label: 'Hadir', variant: 'default' as const },
  ABSENT: { label: 'Tidak Hadir', variant: 'outline' as const },
};

export function AttendanceStatusBadge({ status }: { status: 'REGISTERED' | 'CHECKED_IN' | 'ABSENT' }) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
