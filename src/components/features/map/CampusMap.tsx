'use client';

import { useEffect, useRef } from 'react';
import { useRideStore } from '@/stores/ride.store';
import type { Scooter, Station } from '@/types/domain';

const CAMPUS_CENTER: [number, number] = [34.04494255638137, -5.064716632430015];
const DEFAULT_ZOOM = 16;

interface Props {
  scooters: Scooter[];
  stations: Station[];
}

export function CampusMap({ scooters, stations }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
  const markersRef = useRef<unknown[]>([]);
  const selectScooter = useRideStore((s) => s.selectScooter);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    import('leaflet').then((L) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!, { zoomControl: true })
        .setView(CAMPUS_CENTER, DEFAULT_ZOOM);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      // Station markers with labels
      stations.forEach((station) => {
        const icon = L.divIcon({
          className: '',
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -38],
          html: `<div style="width:36px;height:36px;border-radius:50%;background:#003A7A;border:2px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.3);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
          </div>`,
        });

        // Station label always visible on map
        const labelIcon = L.divIcon({
          className: '',
          iconSize: [120, 20],
          iconAnchor: [60, -8],
          html: `<div style="background:rgba(0,58,122,.85);color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:10px;white-space:nowrap;text-align:center;">${station.label}</div>`,
        });

        L.marker([station.lat, station.lng], { icon }).addTo(map)
          .bindPopup(`<b style="color:#003A7A">${station.label}</b><br><small>${station.availableCount} disponibles · ${station.capacity} bornes</small>`).openPopup();

        L.marker([station.lat, station.lng], { icon: labelIcon, interactive: false }).addTo(map);
      });

      // Scooter markers
      scooters.forEach((sc) => {
        const available = sc.status === 'available';
        const bg = available ? '#00c9b1' : sc.status === 'charging' ? '#f59e0b' : '#94a3b8';
        const icon = L.divIcon({
          className: '',
          iconSize: [42, 42],
          iconAnchor: [21, 21],
          html: `<div style="width:42px;height:42px;border-radius:50%;background:${bg};border:2px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 12px rgba(0,201,177,.4);cursor:${available ? 'pointer' : 'default'};opacity:${available ? 1 : 0.65};">
            <svg width="22" height="22" viewBox="0 0 200 200"><rect width="200" height="200" rx="40" fill="#00c9b1"/><circle cx="100" cy="100" r="60" fill="white"/><circle cx="100" cy="100" r="34" fill="#00c9b1"/><circle cx="100" cy="100" r="14" fill="white"/></svg>
          </div>`,
        });

        const marker = L.marker([sc.lat, sc.lng], { icon }).addTo(map);
        marker.bindTooltip(`${sc.code} · ${sc.batteryPct}%`, { direction: 'top', offset: [0, -24], permanent: available, className: available ? 'leaflet-pogo-tooltip' : '' });
        if (available) marker.on('click', () => selectScooter(sc));
        markersRef.current.push(marker);
      });
    });

    return () => {
      if (mapInstanceRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapInstanceRef.current as any).remove();
        mapInstanceRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </>
  );
}
