// lib/export-participants.ts
import type { ParticipantRow } from '@/hooks/use-admin-participants';
import { exportName, removeEmoji } from '@/lib/export-text';

interface ExportEventInfo {
  name: string;
  eventDate: string;
}

const attendanceLabel = {
  REGISTERED: 'Terdaftar',
  CHECKED_IN: 'Hadir',
  ABSENT: 'Tidak Hadir',
} as const;

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  });
}

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function paidOnly(rows: ParticipantRow[]) {
  return rows.filter((row) => row.paymentStatus === 'VERIFIED').sort((a, b) => exportName(a.member.name).localeCompare(exportName(b.member.name)));
}

export async function exportPaidParticipantsToPDF(rows: ParticipantRow[], event: ExportEventInfo) {
  const { default: jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;

  const participants = paidOnly(rows);
  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.text(`Daftar Peserta - ${removeEmoji(event.name)}`, 14, 15);
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Tanggal event: ${formatDate(event.eventDate)}`, 14, 21);
  doc.text(`Diekspor: ${new Date().toLocaleString('id-ID')}`, 14, 26);
  doc.setTextColor(40);

  autoTable(doc, {
    startY: 32,
    head: [['No', 'Nama']],
    body: participants.map((row, index) => [String(index + 1), exportName(row.member.name)]),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [22, 35, 73] },
    columnStyles: { 0: { cellWidth: 16 } },
  });

  doc.save(`peserta-${slug(removeEmoji(event.name))}-${Date.now()}.pdf`);
}

export async function exportPaidParticipantsToExcel(rows: ParticipantRow[], event: ExportEventInfo) {
  const XLSX = await import('xlsx');

  const participants = paidOnly(rows);
  const totalPaid = participants.reduce((sum, row) => sum + row.amountPaid, 0);

  const summaryRows = [
    { Keterangan: 'Event', Nilai: removeEmoji(event.name) },
    { Keterangan: 'Tanggal Event', Nilai: formatDate(event.eventDate) },
    { Keterangan: 'Total Peserta Lunas', Nilai: participants.length },
    { Keterangan: 'Total Terkumpul', Nilai: totalPaid },
    {},
  ];

  const dataRows = participants.map((row, index) => ({
    No: index + 1,
    Nama: exportName(row.member.name),
    Email: row.member.email,
    'No. HP': row.member.phone ?? '-',
    'Jumlah Dibayar': row.amountPaid,
    'Status Kehadiran': attendanceLabel[row.status],
    'Waktu Check-in': row.checkedInAt ? formatDateTime(row.checkedInAt) : '-',
    'Tanggal Daftar': formatDate(row.registeredAt),
  }));

  const sheet = XLSX.utils.json_to_sheet(summaryRows, { skipHeader: true });
  XLSX.utils.sheet_add_json(sheet, dataRows, { origin: -1 });
  sheet['!cols'] = [{ wch: 20 }, { wch: 26 }, { wch: 28 }, { wch: 16 }, { wch: 16 }, { wch: 18 }, { wch: 22 }, { wch: 16 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Peserta Lunas');
  XLSX.writeFile(workbook, `peserta-${slug(removeEmoji(event.name))}-${Date.now()}.xlsx`);
}
