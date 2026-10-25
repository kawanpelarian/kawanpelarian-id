// components/admin/route-map-picker.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

export interface RoutePoint {
  lat: number;
  lng: number;
}

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

interface RouteMapPickerProps {
  waypoints: RoutePoint[];
  onWaypointsChange: (waypoints: RoutePoint[]) => void;
  line: RoutePoint[];
  onLineChange: (line: RoutePoint[]) => void;
  centerLat?: number;
  centerLng?: number;
}

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Batas toleransi: kalau jarak hasil OSRM lebih dari 2.5x jarak garis lurus,
// dianggap "muter aneh" dan di-fallback ke garis lurus buat segmen itu
const DETOUR_TOLERANCE = 2.5;

function haversineDistance(a: RoutePoint, b: RoutePoint): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;

  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

// Snap satu segmen (2 titik) ke jalan. Kalau hasilnya "muter" jauh dari garis
// lurus (indikasi rekomendasi jalur aneh dari OSRM), fallback ke garis lurus.
async function snapSegment(from: RoutePoint, to: RoutePoint): Promise<RoutePoint[]> {
  const straightDistance = haversineDistance(from, to);

  try {
    const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`);

    if (!res.ok) throw new Error('OSRM request failed');

    const data = await res.json();
    const route = data?.routes?.[0];
    const coordinates: [number, number][] | undefined = route?.geometry?.coordinates;
    const routeDistanceKm: number = route?.distance ? route.distance / 1000 : Infinity;

    if (!coordinates) throw new Error('Rute tidak ditemukan');

    // Sanity check: kalau OSRM muter jauh banget dari garis lurus, tolak hasilnya
    if (routeDistanceKm > straightDistance * DETOUR_TOLERANCE) {
      return [from, to];
    }

    return coordinates.map(([lng, lat]) => ({ lat, lng }));
  } catch {
    // OSRM gagal/down -> fallback garis lurus buat segmen ini
    return [from, to];
  }
}

async function buildRoadSnappedLine(waypoints: RoutePoint[]): Promise<RoutePoint[]> {
  if (waypoints.length < 2) return waypoints;

  const segments = await Promise.all(waypoints.slice(0, -1).map((point, i) => snapSegment(point, waypoints[i + 1])));

  // Gabung semua segmen, hindari titik duplikat di sambungan
  const line: RoutePoint[] = [];
  segments.forEach((segment, i) => {
    line.push(...(i === 0 ? segment : segment.slice(1)));
  });

  return line;
}

function ClickHandler({ onAddPoint }: { onAddPoint: (point: RoutePoint) => void }) {
  useMapEvents({
    click(e) {
      onAddPoint({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function FlyToLocation({ target }: { target: RoutePoint | null }) {
  const map = useMap();

  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], 15, { duration: 1 });
    }
  }, [target, map]);

  return null;
}

function LocationSearch({ onSelect }: { onSelect: (point: RoutePoint) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = (value: string) => {
    setQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 3) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const sumutViewbox = '97.0,4.5,100.5,1.0';

        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&countrycodes=id&viewbox=${sumutViewbox}&bounded=1&limit=5`);
        const data: SearchResult[] = await res.json();
        setResults(data);
        setShowResults(true);
      } catch (error) {
        console.error('Search location error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  };

  const handleSelect = (result: SearchResult) => {
    onSelect({ lat: parseFloat(result.lat), lng: parseFloat(result.lon) });
    setQuery(result.display_name);
    setShowResults(false);
  };

  return (
    <div className="relative z-40">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(e) => handleSearch(e.target.value)} onFocus={() => results.length > 0 && setShowResults(true)} placeholder="Cari lokasi (misal: Lapangan Merdeka Medan)" className="bg-background pl-9" />
        {isSearching && <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground" />}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute mt-1 w-full overflow-hidden rounded-lg border border-border bg-background shadow-md">
          {results.map((result, index) => (
            <button key={index} type="button" onClick={() => handleSelect(result)} className="block w-full truncate px-3 py-2 text-left text-sm hover:bg-accent">
              {result.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function RouteMapPicker({ waypoints, onWaypointsChange, line, onLineChange, centerLat = 3.5952, centerLng = 98.6722 }: RouteMapPickerProps) {
  const [flyTarget, setFlyTarget] = useState<RoutePoint | null>(null);
  const [isRouting, setIsRouting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function recompute() {
      if (waypoints.length < 2) {
        onLineChange(waypoints);
        return;
      }

      setIsRouting(true);
      const snapped = await buildRoadSnappedLine(waypoints);
      if (!cancelled) {
        onLineChange(snapped);
        setIsRouting(false);
      }
    }

    recompute();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waypoints]);

  const handleAddPoint = (point: RoutePoint) => {
    onWaypointsChange([...waypoints, point]);
  };

  const displayLine = line.length > 0 ? line : waypoints;

  return (
    <div className="space-y-3">
      <LocationSearch onSelect={setFlyTarget} />

      <div className="relative h-96 w-full overflow-hidden rounded-xl border border-border">
        {isRouting && (
          <div className="absolute right-3 top-3 z-40 flex items-center gap-2 rounded-full bg-background px-3 py-1.5 text-xs text-muted-foreground shadow-md">
            <Loader2 size={12} className="animate-spin" />
            Menyesuaikan ke jalan...
          </div>
        )}

        <MapContainer center={[centerLat, centerLng]} zoom={13} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <ClickHandler onAddPoint={handleAddPoint} />
          <FlyToLocation target={flyTarget} />
          {waypoints.map((point, index) => (
            <Marker key={index} position={[point.lat, point.lng]} icon={markerIcon} />
          ))}
          {displayLine.length > 1 && <Polyline positions={displayLine.map((p) => [p.lat, p.lng])} color="#162349" />}
        </MapContainer>
      </div>
    </div>
  );
}
