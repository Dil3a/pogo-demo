'use client';

import { useEffect, useRef } from 'react';
import { useRideStore } from '@/stores/ride.store';
import type { Scooter, Station } from '@/types/domain';

const CAMPUS_CENTER: [number, number] = [33.9716, -5.0023];
const DEFAULT_ZOOM = 16;

interface Props {
  scooters: Scooter[];
  stations: Station[];
}

export function CampusMap({ scooters, stations }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);
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

      // Remove any previous Leaflet instance on this container (React 18 strict mode mounts twice).
      if ((mapRef.current as any)._leaflet_id) {
        (mapRef.current as any)._leaflet_id = null;
      }
      const map = L.map(mapRef.current!).setView(CAMPUS_CENTER, DEFAULT_ZOOM);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      stations.forEach((station) => {
        const icon = L.divIcon({
          className: '',
          html: `<div style="width:36px;height:36px;border-radius:50%;background:#003A7A;border:2px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -36],
        });

        L.marker([station.lat, station.lng], { icon })
          .addTo(map)
          .bindPopup(`<strong style="color:#003A7A">${station.label}</strong><br/><span style="font-size:12px">${station.availableCount} disponibles · ${station.capacity} bornes</span>`);
      });

      scooters.forEach((scooter) => {
        const lat = scooter.lat ?? stations.find(s => s.id === scooter.stationId)?.lat;
        const lng = scooter.lng ?? stations.find(s => s.id === scooter.stationId)?.lng;
        if (lat === undefined || lng === undefined) return;

        const available = scooter.status === 'available';
        const bgColor = available ? '#00c9b1' : '#94a3b8';

        const icon = L.divIcon({
          className: '',
          html: `<button style="width:44px;height:44px;border-radius:50%;background:${bgColor};border:2px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 10px rgba(0,201,177,0.4);cursor:${available ? 'pointer' : 'not-allowed'};opacity:${available ? '1' : '0.6'};">
            <svg width="26" height="26" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <rect width="200" height="200" rx="40" fill="#00c9b1"/>
              <circle cx="100" cy="100" r="60" fill="white"/>
              <circle cx="100" cy="100" r="34" fill="#00c9b1"/>
              <circle cx="100" cy="100" r="14" fill="white"/>
            </svg>
          </button>`,
          iconSize: [44, 44],
          iconAnchor: [22, 22],
          popupAnchor: [0, -26],
        });

        const marker = L.marker([lat, lng], { icon }).addTo(map);

        if (available) {
          marker.on('click', () => selectScooter(scooter));
        }

        marker.bindTooltip(
          `${scooter.code} · ${scooter.batteryPct}% · ${available ? 'Disponible' : 'Indisponible'}`,
          { direction: 'top', offset: [0, -26] }
        );
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