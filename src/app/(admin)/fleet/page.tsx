'use client';

/**
 * Admin fleet view — full table of every scooter with status, battery, station.
 *
 * Each row is read-only at MVP. Future actions (force-unlock, mark for
 * maintenance, recall) would dispatch admin-only mutations from this screen.
 */

import { Bike } from 'lucide-react';
import { Card, Skeleton } from '@/components/ui';
import { ScooterStatusBadge } from '@/components/features/scooter/ScooterStatusBadge';
import { useScooters } from '@/hooks/useScooters';
import { formatRelative } from '@/lib/format/money';

export default function AdminFleetPage() {
  const { data: scooters, isLoading } = useScooters();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-uemf-blue">
          <Bike className="h-6 w-6" /> Flotte
        </h1>
        <p className="text-sm text-slate-500">
          Toutes les trottinettes POGO suivies en temps réel.
        </p>
      </div>

      <Card className="!p-0 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Batterie</th>
              <th className="px-4 py-3">Station</th>
              <th className="px-4 py-3">Dernière télémétrie</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={5} className="px-4 py-3">
                    <Skeleton className="h-5 w-full" />
                  </td>
                </tr>
              ))
            ) : !scooters || scooters.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Aucune trottinette.
                </td>
              </tr>
            ) : (
              scooters.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-uemf-blue">
                    {s.code}
                  </td>
                  <td className="px-4 py-3">
                    <ScooterStatusBadge status={s.status} />
                  </td>
                  <td className="px-4 py-3">
                    <BatteryCell pct={s.batteryPct} />
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {s.stationLabel ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {s.lastSeenAt ? formatRelative(s.lastSeenAt) : 'jamais'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function BatteryCell({ pct }: { pct: number }) {
  const color =
    pct > 60 ? 'bg-green-500' : pct > 30 ? 'bg-orange-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-16 overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold tabular-nums text-slate-700">
        {pct}%
      </span>
    </div>
  );
}
