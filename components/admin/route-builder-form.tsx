'use client';

import dynamic from 'next/dynamic';
import { Undo2, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { generateRoutePng } from '@/lib/generate-route-png';
import type { RoutePoint } from '@/components/admin/route-map-picker';

const RouteMapPicker = dynamic(() => import('@/components/admin/route-map-picker').then((mod) => mod.RouteMapPicker), { ssr: false, loading: () => <div className="h-96 w-full animate-pulse rounded-xl bg-muted" /> });

export interface RouteFormValues {
  waypoints: RoutePoint[];
  line: RoutePoint[];
  distanceKm: number | null;
  startLabel: string;
  finishLabel: string;
}

interface RouteBuilderFormProps {
  value: RouteFormValues;
  onChange: (value: RouteFormValues) => void;
}

export function RouteBuilderForm({ value, onChange }: RouteBuilderFormProps) {
  const handleUndo = () => {
    onChange({ ...value, waypoints: value.waypoints.slice(0, -1) });
  };

  const handleClear = () => {
    onChange({ ...value, waypoints: [], line: [] });
  };

  const handleDownloadPng = () => {
    const pointsToRender = value.line.length > 0 ? value.line : value.waypoints;
    if (pointsToRender.length < 2) return;

    const dataUrl = generateRoutePng(pointsToRender);

    const link = document.createElement('a');
    link.download = 'rute-kawan-pelarian.png';
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Label>Gambar Rute</Label>
          <p className="text-sm text-muted-foreground">Klik di peta untuk menandai titik. Garis otomatis mengikuti jalan. {value.waypoints.length} titik ditambahkan.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={handleUndo} disabled={value.waypoints.length === 0}>
            <Undo2 size={14} />
            Undo
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={handleClear} disabled={value.waypoints.length === 0}>
            <Trash2 size={14} />
            Hapus Semua
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={handleDownloadPng} disabled={value.waypoints.length < 2}>
            <Download size={14} />
            Save PNG
          </Button>
        </div>
      </div>

      <RouteMapPicker waypoints={value.waypoints} onWaypointsChange={(waypoints) => onChange({ ...value, waypoints })} line={value.line} onLineChange={(line) => onChange({ ...value, line })} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="distanceKm">Jarak (KM)</Label>
          <Input id="distanceKm" type="number" step="0.1" min={0} value={value.distanceKm ?? ''} onChange={(e) => onChange({ ...value, distanceKm: e.target.value ? Number(e.target.value) : null })} placeholder="5" />
          <p className="text-sm text-muted-foreground">Diisi manual, bukan otomatis.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="startLabel">Titik Start</Label>
          <Input id="startLabel" value={value.startLabel} onChange={(e) => onChange({ ...value, startLabel: e.target.value })} placeholder="Lapangan Merdeka" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="finishLabel">Titik Finish</Label>
          <Input id="finishLabel" value={value.finishLabel} onChange={(e) => onChange({ ...value, finishLabel: e.target.value })} placeholder="Lapangan Merdeka" />
        </div>
      </div>
    </div>
  );
}
