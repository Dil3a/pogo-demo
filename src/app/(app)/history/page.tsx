'use client';

/**
 * History page — chronological list of the user's past rides.
 *
 * Each row links to /ride/[id] so a user can re-open a receipt at any time.
 * Pagination is not implemented at MVP (a student rarely has >50 rides).
 */

import Link from 'next/link';
import { ChevronRight, ScrollText } from 'lucide-react';
import { Card, Skeleton } from '@/components/ui';
import { ScooterStatusBadge } from '@/components/features/scooter/ScooterStatusBadge';
import { useRideHistory } from '@/hooks/useRides';
import { formatMoney, formatDateTime } from '@/lib/format/money';
import type { Ride } from '@/types/domain';

const STATUS_BADGES: Record<
  Ride['status'],
  { label: string; cls: string }
> = {
  reserved: { label: 'Réservé', cls: 'bg-blue-50 text-blue-700' },
  unlocking: { label: 'Déverrouillage', cls: 'bg-blue-50 text-blue-700' },
  active: { label: 'En cours', cls: 'bg-pogo-50 text-pogo-700' },
  completed: { label: 'Terminé', cls: 'bg-green-50 text-green-700' },
  cancelled: { label: 'Annulé', cls: 'bg-red-50 text-red-700' },
};

export default function HistoryPage() {
  const { data: rides, isLoading } = useRideHistory();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="flex items-center gap-2 text-lg font-bold text-uemf-blue">
        <ScrollText className="h-5 w-5" /> Mes trajets
      </h1>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : !rides || rides.length === 0 ? (
        <Card className="text-center text-sm text-slate-500">
          Aucun trajet pour le moment. Scannez une trottinette pour commencer.
        </Card>
      ) : (
        <ul className="flex flex-col gap-2">
          {rides.map((ride) => {
            const badge = STATUS_BADGES[ride.status];
            return (
              <li key={ride.id}>
                <Link
                  href={`/ride/${ride.id}`}
                  className="block rounded-xl border border-slate-200 bg-white p-4 transition hover:border-pogo-300 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-pogo-50 text-pogo-700">
                        <span className="text-xs font-bold">
                          {ride.scooterCode}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800">
                          {ride.startStationLabel}
                        </div>
                        <div className="text-xs text-slate-500">
                          {formatDateTime(ride.reservedAt)}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${badge.cls}`}
                          >
                            {badge.label}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {ride.durationHours}h
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-pogo-700">
                        {formatMoney(ride.amountCentimes)}
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
