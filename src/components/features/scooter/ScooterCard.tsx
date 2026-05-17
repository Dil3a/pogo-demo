'use client';

/**
 * ScooterCard — visual mirror of the trotinette card from the UEMF portal:
 *   - Status-coloured border (POGO teal / red / orange)
 *   - Battery % with traffic-light colour
 *   - Mini POGO mark
 *   - Reserve CTA disabled when unavailable
 *
 * The card reads `stationLabel` denormalised on the Scooter itself, which
 * spares us a parent-level lookup in list contexts.
 */

import { RefreshCw } from 'lucide-react';
import { BrandPogoMini } from '@/components/ui/Brand';
import { Button } from '@/components/ui/Button';
import { ScooterStatusBadge } from './ScooterStatusBadge';
import { formatMoney } from '@/lib/format/money';
import type { Scooter } from '@/types/domain';

interface RateBucket {
  hours: number;
  priceCentimes: number;
}

interface Props {
  scooter: Scooter;
  rateCard?: RateBucket[];
  onReserve: (scooter: Scooter) => void;
}

function batteryColor(pct: number) {
  if (pct > 60) return '#2e7d32';
  if (pct > 30) return '#e65100';
  return '#c62828';
}

export function ScooterCard({ scooter, rateCard, onReserve }: Props) {
  const isAvailable = scooter.status === 'available';
  const iconColor = isAvailable
    ? '#00c9b1'
    : scooter.status === 'occupied'
      ? '#c62828'
      : '#e65100';

  const borderClass = isAvailable
    ? 'border-pogo-300 bg-gradient-to-br from-pogo-50 to-pogo-100 shadow-pogo-card'
    : scooter.status === 'occupied'
      ? 'border-red-200 bg-gradient-to-br from-red-50 to-red-100'
      : scooter.status === 'charging'
        ? 'border-orange-200 bg-gradient-to-br from-yellow-50 to-yellow-100'
        : 'border-slate-200 bg-slate-50';

  return (
    <div
      className={`rounded-xl border p-4 text-center transition hover:-translate-y-0.5 ${borderClass}`}
    >
      <div className="mb-2 flex items-center justify-center gap-1.5">
        <BrandPogoMini />
        <span className="text-[11px] font-black tracking-wider text-pogo-700">
          POGO
        </span>
      </div>
      <RefreshCw
        className="mx-auto"
        size={26}
        style={{ color: iconColor }}
        aria-hidden="true"
      />
      <div className="mt-1 text-sm font-bold text-slate-800">{scooter.code}</div>
      <div className="mt-0.5 text-[10px] text-slate-500">
        {scooter.stationLabel ?? '—'}
      </div>
      <div
        className="my-1 text-[11px] font-semibold"
        style={{ color: batteryColor(scooter.batteryPct) }}
      >
        Batterie {scooter.batteryPct}%
      </div>
      <ScooterStatusBadge status={scooter.status} />
      {isAvailable && rateCard && (
        <div className="my-1.5 text-[11px] font-bold text-pogo-700">
          {rateCard
            .slice(0, 2)
            .map((r) => `${r.hours}h=${formatMoney(r.priceCentimes)}`)
            .join(' · ')}
        </div>
      )}
      <Button
        size="sm"
        fullWidth
        onClick={() => onReserve(scooter)}
        disabled={!isAvailable}
        className="mt-2 !rounded-lg"
      >
        {isAvailable ? 'Réserver' : 'Indisponible'}
      </Button>
    </div>
  );
}
