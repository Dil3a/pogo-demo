'use client';

/**
 * Admin dashboard — at-a-glance fleet health.
 *
 * Reuses the public scooters and rides endpoints; a future iteration will
 * have admin-only aggregation endpoints (/admin/stats/daily) for charting.
 */

import { Bike, BatteryCharging, AlertTriangle, Activity } from 'lucide-react';
import { Card, Skeleton } from '@/components/ui';
import { useScooters } from '@/hooks/useScooters';
import { useRideHistory } from '@/hooks/useRides';

export default function AdminDashboard() {
  const { data: scooters, isLoading: scootersLoading } = useScooters();
  const { data: rides, isLoading: ridesLoading } = useRideHistory();

  const total = scooters?.length ?? 0;
  const available =
    scooters?.filter((s) => s.status === 'available').length ?? 0;
  const charging = scooters?.filter((s) => s.status === 'charging').length ?? 0;
  const lowBattery = scooters?.filter((s) => s.batteryPct < 25).length ?? 0;
  const activeRides =
    rides?.filter((r) => r.status === 'active' || r.status === 'unlocking')
      .length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-uemf-blue">Tableau de bord</h1>
        <p className="text-sm text-slate-500">
          Vue d&apos;ensemble de la flotte POGO sur le campus.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat
          loading={scootersLoading}
          icon={Bike}
          label="Trottinettes"
          value={total}
          tone="blue"
        />
        <Stat
          loading={scootersLoading}
          icon={Activity}
          label="Disponibles"
          value={available}
          tone="green"
        />
        <Stat
          loading={scootersLoading}
          icon={BatteryCharging}
          label="En charge"
          value={charging}
          tone="orange"
        />
        <Stat
          loading={scootersLoading}
          icon={AlertTriangle}
          label="Batterie < 25%"
          value={lowBattery}
          tone="red"
        />
      </div>

      <Card>
        <h2 className="text-sm font-bold text-uemf-blue">Trajets en cours</h2>
        <div className="mt-2 text-4xl font-black text-pogo-700">
          {ridesLoading ? '…' : activeRides}
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Trajets actifs ou en cours de déverrouillage à l&apos;instant.
        </p>
      </Card>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tone,
  loading,
}: {
  icon: typeof Bike;
  label: string;
  value: number;
  tone: 'blue' | 'green' | 'orange' | 'red';
  loading?: boolean;
}) {
  const toneClass = {
    blue: 'border-uemf-blue text-uemf-blue',
    green: 'border-green-600 text-green-700',
    orange: 'border-orange-500 text-orange-700',
    red: 'border-red-500 text-red-700',
  }[tone];

  return (
    <Card className={`!p-4 [border-top:4px_solid] ${toneClass.split(' ')[0]}`}>
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Icon className="h-4 w-4" /> {label}
      </div>
      {loading ? (
        <Skeleton className="mt-2 h-8 w-16" />
      ) : (
        <div className={`mt-1 text-3xl font-black ${toneClass.split(' ')[1]}`}>
          {value}
        </div>
      )}
    </Card>
  );
}
