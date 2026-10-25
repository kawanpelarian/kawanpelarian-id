// components/public/route-preview-map.tsx
'use client';

import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import L from 'leaflet';

interface RoutePoint {
  lat: number;
  lng: number;
}

function FitBounds({ points }: { points: RoutePoint[] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [24, 24] });
  }, [points, map]);

  return null;
}

export function RoutePreviewMap({ points }: { points: RoutePoint[] }) {
  if (points.length === 0) return null;

  return (
    <MapContainer center={[points[0].lat, points[0].lng]} zoom={13} scrollWheelZoom={false} dragging={false} zoomControl={false} doubleClickZoom={false} attributionControl={false} style={{ height: '100%', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Polyline positions={points.map((p) => [p.lat, p.lng])} color="#162349" weight={4} />
      <FitBounds points={points} />
    </MapContainer>
  );
}
