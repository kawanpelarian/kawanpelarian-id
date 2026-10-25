// lib/export-orders.ts
import type { AdminOrder } from '@/hooks/use-admin-orders';

const statusLabel = {
  PENDING: 'Menunggu Verifikasi',
  VERIFIED: 'Terverifikasi',
  REJECTED: 'Ditolak',
} as const;

function summarizeItems(order: AdminOrder) {
  return order.items.map((item) => `${item.variant.product.name} (${item.variant.size}) x${item.quantity}`).join(', ');
}

// Label batch opsional ("Batch 2"), ditempel ke judul dan nama file export
function withBatch(title: string, batchLabel?: string) {
  return batchLabel ? `${title} (${batchLabel})` : title;
}

function fileSuffix(batchLabel?: string) {
  return batchLabel ? `-${batchLabel.toLowerCase().replace(/\s+/g, '-')}` : '';
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Rekap total per Produk+Ukuran, khusus buat dikirim ke konveksi - cuma
// pesanan yang belum ditolak (Pending+Verified) yang diitung, soalnya yang
// Ditolak gak jadi diproduksi. Dipakai bareng sama Excel dan PDF.
function buildSizeRecap(orders: AdminOrder[]) {
  const sizeMap = new Map<string, { produk: string; ukuran: string; jumlah: number }>();

  for (const order of orders) {
    if (order.status === 'REJECTED') continue;
    for (const item of order.items) {
      const key = `${item.variant.product.name}__${item.variant.size}`;
      const existing = sizeMap.get(key);
      if (existing) {
        existing.jumlah += item.quantity;
      } else {
        sizeMap.set(key, {
          produk: item.variant.product.name,
          ukuran: item.variant.size,
          jumlah: item.quantity,
        });
      }
    }
  }

  const rows = Array.from(sizeMap.values()).sort((a, b) => a.produk.localeCompare(b.produk) || a.ukuran.localeCompare(b.ukuran));
  const totalUnit = rows.reduce((sum, r) => sum + r.jumlah, 0);

  return { rows, totalUnit };
}

// Library berat, di-load pas dibutuhin aja (pas tombol export diklik),
// biar gak nambahin ukuran bundle awal buat semua orang yang buka halaman ini
export async function exportOrdersToExcel(orders: AdminOrder[], batchLabel?: string) {
  const XLSX = await import('xlsx');

  const totalOrders = orders.length;
  const uniqueBuyers = new Set(orders.map((o) => o.member.id)).size;

  const summaryRows = [{ Keterangan: 'Total Pesanan', Nilai: totalOrders }, { Keterangan: 'Total Pemesan (Orang)', Nilai: uniqueBuyers }, {}];

  // 1 baris per ITEM (bukan per order), biar kalau 1 orang beli beberapa
  // varian sekaligus, tiap varian jadi baris terpisah - lebih gampang
  // direkap/di-filter di Excel
  const dataRows = orders.flatMap((order) =>
    order.items.map((item) => ({
      Pemesan: order.member.name,
      Email: order.member.email,
      'No. HP': order.member.phone ?? '-',
      Produk: item.variant.product.name,
      Ukuran: item.variant.size,
      Jumlah: item.quantity,
      Subtotal: item.price * item.quantity,
      Status: statusLabel[order.status],
      Tanggal: formatDate(order.createdAt),
    })),
  );

  const detailSheet = XLSX.utils.json_to_sheet(summaryRows, { skipHeader: true });
  XLSX.utils.sheet_add_json(detailSheet, dataRows, { origin: -1 });
  detailSheet['!cols'] = [{ wch: 22 }, { wch: 25 }, { wch: 15 }, { wch: 24 }, { wch: 10 }, { wch: 8 }, { wch: 12 }, { wch: 18 }, { wch: 14 }];

  const { rows: sizeRows, totalUnit } = buildSizeRecap(orders);
  const recapRows: { Produk: string; Ukuran: string; 'Total Jumlah': number }[] = sizeRows.map((row) => ({ Produk: row.produk, Ukuran: row.ukuran, 'Total Jumlah': row.jumlah }));
  recapRows.push({ Produk: '', Ukuran: 'TOTAL', 'Total Jumlah': totalUnit });

  const recapSheet = XLSX.utils.json_to_sheet(recapRows);
  recapSheet['!cols'] = [{ wch: 26 }, { wch: 12 }, { wch: 14 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, recapSheet, 'Rekap Ukuran');
  XLSX.utils.book_append_sheet(workbook, detailSheet, 'Detail Pesanan');
  XLSX.writeFile(workbook, `pesanan-kawan-pelarian${fileSuffix(batchLabel)}-${Date.now()}.xlsx`);
}

export async function exportOrdersToPDF(orders: AdminOrder[], batchLabel?: string) {
  const { default: jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;

  const doc = new jsPDF();

  const totalOrders = orders.length;
  const uniqueBuyers = new Set(orders.map((o) => o.member.id)).size;
  const { rows: sizeRows, totalUnit } = buildSizeRecap(orders);

  doc.setFontSize(14);
  doc.text(withBatch('Rekap Pesanan - Kawan Pelarian', batchLabel), 14, 15);
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Diekspor: ${new Date().toLocaleString('id-ID')}`, 14, 21);

  doc.setFontSize(10);
  doc.setTextColor(40);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Pesanan: ${totalOrders}`, 14, 28);
  doc.text(`Total Pemesan: ${uniqueBuyers} orang`, 90, 28);
  doc.setFont('helvetica', 'normal');

  // Tabel 1: Rekap Ukuran - ini bagian yang dikirim ke konveksi
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Rekap Ukuran (Buat Konveksi)', 14, 38);
  doc.setFont('helvetica', 'normal');

  autoTable(doc, {
    startY: 42,
    head: [['Produk', 'Ukuran', 'Jumlah']],
    body: [...sizeRows.map((row) => [row.produk, row.ukuran, String(row.jumlah)]), ['', 'TOTAL', String(totalUnit)]],
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [22, 35, 73] },
    didParseCell: (data) => {
      if (data.row.index === sizeRows.length) {
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  // Tabel 2: Detail Pesanan - buat referensi siapa pesan apa
  const afterRecapY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Detail Pesanan', 14, afterRecapY + 10);
  doc.setFont('helvetica', 'normal');

  autoTable(doc, {
    startY: afterRecapY + 14,
    head: [['Pemesan', 'Item', 'Total', 'Status', 'Tanggal']],
    body: orders.map((order) => [order.member.name, summarizeItems(order), `Rp${order.totalAmount.toLocaleString('id-ID')}`, statusLabel[order.status], formatDate(order.createdAt)]),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [22, 35, 73] },
    columnStyles: { 1: { cellWidth: 60 } },
  });

  doc.save(`pesanan-kawan-pelarian${fileSuffix(batchLabel)}-${Date.now()}.pdf`);
}

export async function exportSizeRecapToPDF(orders: AdminOrder[], batchLabel?: string) {
  const { default: jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;

  const doc = new jsPDF();
  const { rows, totalUnit } = buildSizeRecap(orders);

  doc.setFontSize(14);
  doc.text(withBatch('Rekap Ukuran Konveksi - Kawan Pelarian', batchLabel), 14, 15);
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Diekspor: ${new Date().toLocaleString('id-ID')}`, 14, 21);
  doc.setTextColor(40);

  autoTable(doc, {
    startY: 27,
    head: [['Produk', 'Ukuran', 'Jumlah']],
    body: [...rows.map((r) => [r.produk, r.ukuran, String(r.jumlah)]), ['', 'TOTAL', String(totalUnit)]],
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [22, 35, 73] },
    didParseCell: (data) => {
      if (data.row.index === rows.length) data.cell.styles.fontStyle = 'bold';
    },
  });

  doc.save(`rekap-konveksi${fileSuffix(batchLabel)}-${Date.now()}.pdf`);
}

export async function exportSizeRecapToWord(orders: AdminOrder[], batchLabel?: string) {
  const { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType, AlignmentType, ShadingType, BorderStyle } = await import('docx');

  const { rows, totalUnit } = buildSizeRecap(orders);

  // Samakan dengan gaya PDF: Helvetica/Arial, judul 14pt, teks tabel 9pt,
  // header gelap (#162349), baris selang-seling abu muda, tanpa garis tepi.
  const FONT = 'Arial';
  const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
  const borders = {
    top: noBorder,
    bottom: noBorder,
    left: noBorder,
    right: noBorder,
  };

  const cell = (text: string, opts: { bold?: boolean; header?: boolean; right?: boolean; fill?: string } = {}) =>
    new TableCell({
      borders,
      shading: opts.header ? { type: ShadingType.CLEAR, fill: '162349', color: 'auto' } : opts.fill ? { type: ShadingType.CLEAR, fill: opts.fill, color: 'auto' } : undefined,
      margins: { top: 85, bottom: 85, left: 85, right: 85 },
      children: [
        new Paragraph({
          alignment: opts.right ? AlignmentType.RIGHT : AlignmentType.LEFT,
          children: [
            new TextRun({
              text,
              font: FONT,
              bold: opts.bold || opts.header,
              color: opts.header ? 'FFFFFF' : '282828',
              size: 18,
            }),
          ],
        }),
      ],
    });

  const STRIPE = 'F5F5F5';

  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: noBorder,
      bottom: noBorder,
      left: noBorder,
      right: noBorder,
      insideHorizontal: noBorder,
      insideVertical: noBorder,
    },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [cell('Produk', { header: true }), cell('Ukuran', { header: true }), cell('Jumlah', { header: true, right: true })],
      }),
      ...rows.map((r, idx) => {
        const fill = idx % 2 === 1 ? STRIPE : undefined;
        return new TableRow({
          children: [cell(r.produk, { fill }), cell(r.ukuran, { fill }), cell(String(r.jumlah), { fill, right: true })],
        });
      }),
      new TableRow({
        children: [
          cell('', { bold: true, fill: rows.length % 2 === 1 ? STRIPE : undefined }),
          cell('TOTAL', { bold: true, fill: rows.length % 2 === 1 ? STRIPE : undefined }),
          cell(String(totalUnit), {
            bold: true,
            right: true,
            fill: rows.length % 2 === 1 ? STRIPE : undefined,
          }),
        ],
      }),
    ],
  });

  const doc = new Document({
    styles: { default: { document: { run: { font: FONT } } } },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 800, bottom: 800, left: 800, right: 800 },
          },
        },
        children: [
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: withBatch('Rekap Ukuran Konveksi - Kawan Pelarian', batchLabel),
                font: FONT,
                size: 28,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 240 },
            children: [
              new TextRun({
                text: `Diekspor: ${new Date().toLocaleString('id-ID')}`,
                font: FONT,
                color: '787878',
                size: 18,
              }),
            ],
          }),
          table,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rekap-konveksi${fileSuffix(batchLabel)}-${Date.now()}.docx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
