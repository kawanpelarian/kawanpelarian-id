// lib/generate-route-png.ts
import type { RoutePoint } from '@/components/admin/route-map-picker';

const CANVAS_SIZE = 800;
const PADDING = 60;
const LINE_WIDTH = 5;

export function generateRoutePng(points: RoutePoint[]): string {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Gagal membuat canvas context');

  // Background putih polos (bukan transparan biar aman kalau di-print/share)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const latRange = maxLat - minLat || 0.0001;
  const lngRange = maxLng - minLng || 0.0001;
  const drawArea = CANVAS_SIZE - PADDING * 2;

  // Skala proporsional, ambil yang paling kecil biar rute gak gepeng
  const scale = Math.min(drawArea / lngRange, drawArea / latRange);

  const offsetX = (CANVAS_SIZE - lngRange * scale) / 2;
  const offsetY = (CANVAS_SIZE - latRange * scale) / 2;

  // Lat makin besar = makin ke utara = harus makin ke ATAS canvas,
  // sementara koordinat canvas Y makin besar = makin ke BAWAH, makanya dibalik
  const toCanvasPoint = (point: RoutePoint) => ({
    x: offsetX + (point.lng - minLng) * scale,
    y: CANVAS_SIZE - (offsetY + (point.lat - minLat) * scale),
  });

  const canvasPoints = points.map(toCanvasPoint);

  // Gambar garis rute
  ctx.strokeStyle = '#162349';
  ctx.lineWidth = LINE_WIDTH;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();
  canvasPoints.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });
  ctx.stroke();

  // Titik start (hijau tua/hitam solid) dan finish (outline)
  const start = canvasPoints[0];
  const finish = canvasPoints[canvasPoints.length - 1];

  ctx.fillStyle = '#162349';
  ctx.beginPath();
  ctx.arc(start.x, start.y, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#162349';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(finish.x, finish.y, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  return canvas.toDataURL('image/png');
}
