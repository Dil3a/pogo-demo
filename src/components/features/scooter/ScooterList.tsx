'use client';

/**
 * ScooterList — grid of ScooterCards with status filter chips at the top.
 *
 * State is local — this is a presentational filter; URL-state could be added
 * later (?status=available) without affecting consumers.
 */

import { useMemo, useState } from 'react';
import { ScooterCard } from './ScooterCard';
import { Skeleton } from '@/components/ui';
import { cn } from '@/lib/cn';
import type { Scooter, ScooterStatus } from '@/types/domain';

interface RateBucket {
  hours: number;
  priceCentimes: number;
}

interface Props {
  scooters: Scooter[] | undefined;
  isLoading?: boolean;
  rateCard?: RateBucket[];
  onReserve: (scooter: Scooter) => void;
}

type FilterValue = 'all' | ScooterStatus;

const FILTERS: Array<{ value: FilterValue; label: string }> = [
  { value: 'all', label: 'Toutes' },
  { value: 'available', label: 'Disponibles' },
  { value: 'occupied', label: 'En cours' },
  { value: 'charging', label: 'En charge' },
];

export function ScooterList({
  scooters,
  isLoading,
  rateCard,
  onReserve,
}: Props) {
  const [filter, setFilter] = useState<FilterValue>('all');

  const filtered = useMemo(() => {
    if (!scooters) return [];
    if (filter === 'all') return scooters;
    return scooters.filter((s) => s.status === filter);
  }, [scooters, filter]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'rounded-full border-[1.5px] px-3.5 py-1 text-xs font-semibold transition-all',
              filter === f.value
                ? 'border-transparent bg-gradient-to-br from-uemf-blue to-uemf-green text-white'
                : 'border-slate-300 bg-white text-slate-500 hover:border-uemf-blue hover:text-uemf-blue',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">
          Aucune trottinette ne correspond à ce filtre.
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">
          {filtered.map((s) => (
            <ScooterCard
              key={s.id}
              scooter={s}
              rateCard={rateCard}
              onReserve={onReserve}
            />
          ))}
        </div>
      )}
    </div>
  );
}
