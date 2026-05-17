'use client';

/**
 * Map page — the home screen for authenticated students.
 *
 * Composition:
 *   - Hero stats strip (mirrors UEMF portal's "X disponibles" counters)
 *   - CampusMap (clickable scooter pins)
 *   - ScooterList below for users who prefer browsing in a grid
 *   - RidePanel mounts as a bottom-sheet when a scooter is selected
 *
 * Data:
 *   - useStations / useScooters poll every 15s as a fallback when websockets
 *     aren't available. Real-time pushes will override the cached entries.
 */

import { useMemo } from 'react';
import { Bike, BatteryCharging, Lock } from 'lucide-react';
import { Card, Skeleton } from '@/components/ui';
import { CampusMap } from '@/components/features/map/CampusMap';
import { ScooterList } from '@/components/features/scooter/ScooterList';
import { RidePanel } from '@/components/features/ride/RidePanel';
import { useScooters, useStations } from '@/hooks/useScooters';
import { useRideStore } from '@/stores/ride.store';
import { RATE_CARD } from '@/lib/mock/store';
import type { DurationBucket } from '@/types/domain';

export default function MapPage() {
  const { data: scooters, isLoading: scootersLoading } = useScooters();
  const { data: stations, isLoading: stationsLoading } = useStations();
  const selectScooter = useRideStore((s) => s.selectScooter);

  const rateCard = useMemo(
    () =>
      RATE_CARD.map((r) => ({
        hours: r.hours as DurationBucket,
        priceCentimes: r.priceCentimes,
      })),
    [],
  );

  const counts = useMemo(() => {
    const safe = scooters ?? [];
    return {
      available: safe.filter((s) => s.status === 'available').length,
      occupied: safe.filter((s) => s.status === 'occupied').length,
      charging: safe.filter((s) => s.status === 'charging').length,
    };
  }, [scooters]);

  return (
    <div className="flex flex-col gap-5">
      {/* Hero stats — same visual pattern as the portal's stats-row */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="!p-3 text-center [border-top:4px_solid_#00c9b1]">
          <div className="text-2xl font-extrabold text-pogo-700">
            {scootersLoading ? '…' : counts.available}
          </div>
          <div className="mt-0.5 flex items-center justify-center gap-1 text-[11px] text-slate-500">
            <Bike className="h-3 w-3" /> Disponibles
          </div>
        </Card>
        <Card className="!p-3 text-center [border-top:4px_solid_#c62828]">
          <div className="text-2xl font-extrabold text-red-700">
            {scootersLoading ? '…' : counts.occupied}
          </div>
          <div className="mt-0.5 flex items-center justify-center gap-1 text-[11px] text-slate-500">
            <Lock className="h-3 w-3" /> Occupées
          </div>
        </Card>
        <Card className="!p-3 text-center [border-top:4px_solid_#e65100]">
          <div className="text-2xl font-extrabold text-orange-700">
            {scootersLoading ? '…' : counts.charging}
          </div>
          <div className="mt-0.5 flex items-center justify-center gap-1 text-[11px] text-slate-500">
            <BatteryCharging className="h-3 w-3" /> En charge
          </div>
        </Card>
      </div>

      {/* Map */}
      <Card className="!p-0 overflow-hidden">
        <div className="h-[420px] w-full">
          {stationsLoading || scootersLoading ? (
            <Skeleton className="h-full w-full !rounded-none" />
          ) : (
            <CampusMap
              scooters={scooters ?? []}
              stations={stations ?? []}
            />
          )}
        </div>
      </Card>

      {/* Grid */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-uemf-blue">
          <Bike className="h-4 w-4" />
          Trottinettes du campus
        </h2>
        <ScooterList
          scooters={scooters}
          isLoading={scootersLoading}
          rateCard={rateCard}
          onReserve={selectScooter}
        />
      </section>

      <RidePanel />
    </div>
  );
}
