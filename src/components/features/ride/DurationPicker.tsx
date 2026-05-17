'use client';

/**
 * DurationPicker — three big tap targets for the 1h / 2h / 4h buckets.
 * Pricing is read from the `rateCard` prop rather than hard-coded, so the
 * backend can change rates without a frontend deploy.
 *
 * Why not a slider? Because POGO/UEMF prices are bucketed, not per-minute.
 * A slider would imply continuous pricing — wrong mental model.
 */

import { Check } from 'lucide-react';
import { formatMoney } from '@/lib/format/money';
import { cn } from '@/lib/cn';
import type { DurationBucket } from '@/types/domain';

interface RateBucket {
  hours: DurationBucket;
  priceCentimes: number;
}

interface Props {
  rateCard: RateBucket[];
  value: DurationBucket;
  onChange: (hours: DurationBucket) => void;
}

export function DurationPicker({ rateCard, value, onChange }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {rateCard.map((bucket) => {
        const selected = bucket.hours === value;
        return (
          <button
            key={bucket.hours}
            type="button"
            onClick={() => onChange(bucket.hours)}
            aria-pressed={selected}
            className={cn(
              'relative flex flex-col items-center justify-center gap-1 rounded-2xl border-[1.5px] p-4 transition-all',
              selected
                ? 'border-pogo-500 bg-pogo-50 shadow-md shadow-pogo-500/15'
                : 'border-slate-200 bg-white hover:border-pogo-300',
            )}
          >
            {selected && (
              <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-pogo-500 text-white">
                <Check className="h-3 w-3" />
              </span>
            )}
            <span className="text-2xl font-black text-slate-800">
              {bucket.hours}h
            </span>
            <span className="text-sm font-bold text-pogo-700">
              {formatMoney(bucket.priceCentimes)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
