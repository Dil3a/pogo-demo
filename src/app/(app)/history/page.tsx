'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Receipt, Clock, MapPin, ChevronRight } from 'lucide-react';
import { Card, Skeleton, Badge } from '@/components/ui';
import { useRideHistory } from '@/hooks/useRides';
import { formatMoney, formatTime } from '@/lib/format/money';
import { getClientStore } from '@/lib/client-store';
import type { Ride } from '@/types/domain';

const STATUS_LABELS: Record<string, { label: string; variant: 'green' | 'blue' | 'slate' | 'red' }> = {
  active:    { label: 'En cours',  variant: 'green' },
  reserved:  { label: 'Réservé',   variant: 'blue' },
  completed: { label: 'Terminé',   variant: 'slate' },
  cancelled: { label: 'Annulé',    variant: 'red' },
};

export default function HistoryPage() {
  const store = getClientStore();
  const [rides, setRides] = useState<Ride[]>(() => [...store.rides]);

  // Subscribe to store updates
  useEffect(() => {
    return store.subscribe(() => setRides([...store.rides]));
  }, [store]);

  // Stats
  const completed = rides.filter((r) => r.status === 'completed');
  const totalSpent = completed.reduce((sum, r) => sum + r.amountCentimes, 0);
  const totalRides = completed.length;

  if (rides.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <Receipt className="h-8 w-8 text-slate-400" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-700">Aucun trajet pour le moment</h2>
          <p className="mt-1 text-sm text-slate-500">Réservez votre première trottinette POGO !</p>
        </div>
        <Link
          href="/map"
          className="rounded-xl bg-uemf-blue px-6 py-2.5 text-sm font-bold text-white"
        >
          Voir la carte
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Stats */}
      {totalRides > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <Card className="!p-3 text-center">
            <div className="text-xl font-black text-pogo-700">{totalRides}</div>
            <div className="text-[10px] text-slate-500">Trajets</div>
          </Card>
          <Card className="!p-3 text-center">
            <div className="text-xl font-black text-uemf-blue">{formatMoney(totalSpent)}</div>
            <div className="text-[10px] text-slate-500">Dépensé</div>
          </Card>
          <Card className="!p-3 text-center">
            <div className="text-xl font-black text-uemf-green">
              {Math.round(totalRides * 0.8)} kg
            </div>
            <div className="text-[10px] text-slate-500">CO₂ économisé</div>
          </Card>
        </div>
      )}

      {/* Ride list */}
      <div className="flex flex-col gap-3">
        {rides.map((ride) => {
          const status = STATUS_LABELS[ride.status] ?? { label: ride.status, variant: 'slate' as const };
          return (
            <Card key={ride.id} className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pogo-50 text-xs font-black text-pogo-700 flex-shrink-0">
                {ride.scooterCode}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800">{ride.scooterCode}</span>
                  <Badge variant={status.variant} size="sm">{status.label}</Badge>
                </div>
                <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{ride.startStationLabel}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock className="h-3 w-3 flex-shrink-0" />
                  <span>{new Date(ride.reservedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  <span>· {ride.durationHours}h</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm font-black text-pogo-700">{formatMoney(ride.amountCentimes)}</div>
                {ride.status === 'active' && (
                  <Link href={`/ride/${ride.id}`} className="text-xs text-uemf-blue font-semibold">
                    Voir →
                  </Link>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
