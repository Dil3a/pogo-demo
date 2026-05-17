'use client';

/**
 * PaymentMethodPicker — two-option radio matching the existing portal flow:
 *   - Carte bancaire (external PSP — CMI Maroc / Stripe)
 *   - Carte étudiant (internal wallet, debited atomically with reservation)
 *
 * For "carte étudiant" we also display the live wallet balance, since student
 * cards in this system have a stored value rather than an unlimited credit
 * line. Showing the balance prevents user confusion when the API later returns
 * `INSUFFICIENT_FUNDS`.
 */

import { CreditCard, BadgeCheck } from 'lucide-react';
import { formatMoney } from '@/lib/format/money';
import { cn } from '@/lib/cn';
import type { PaymentMethodType } from '@/types/domain';

interface Props {
  value: PaymentMethodType;
  /** Wallet balance in centimes — used to disable student card when insufficient. */
  walletBalanceCentimes?: number;
  /** Amount due in centimes. */
  amountCentimes: number;
  onChange: (method: PaymentMethodType) => void;
}

export function PaymentMethodPicker({
  value,
  walletBalanceCentimes,
  amountCentimes,
  onChange,
}: Props) {
  const studentDisabled =
    walletBalanceCentimes !== undefined &&
    walletBalanceCentimes < amountCentimes;

  const options: Array<{
    id: PaymentMethodType;
    label: string;
    icon: React.ReactNode;
    sub?: string;
    disabled?: boolean;
  }> = [
    {
      id: 'card',
      label: 'Carte bancaire',
      icon: <BadgeCheck className="h-5 w-5" />,
      sub: 'CMI / Visa / Mastercard',
    },
    {
      id: 'student_card',
      label: 'Carte étudiant',
      icon: <BadgeCheck className="h-5 w-5" />,
      sub:
        walletBalanceCentimes !== undefined
          ? `Solde : ${formatMoney(walletBalanceCentimes)}`
          : 'Solde indisponible',
      disabled: studentDisabled,
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      {options.map((opt) => {
        const selected = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            disabled={opt.disabled}
            onClick={() => onChange(opt.id)}
            aria-pressed={selected}
            className={cn(
              'flex items-center gap-3 rounded-xl border-[1.5px] p-3.5 text-left transition-all',
              selected
                ? 'border-pogo-500 bg-pogo-50'
                : 'border-slate-200 bg-white hover:border-slate-400',
              opt.disabled && 'cursor-not-allowed opacity-50',
            )}
          >
            <span
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg',
                selected
                  ? 'bg-pogo-500 text-white'
                  : 'bg-slate-100 text-slate-600',
              )}
            >
              {opt.icon}
            </span>
            <div className="flex-1">
              <div className="text-sm font-bold text-slate-800">
                {opt.label}
              </div>
              {opt.sub && (
                <div className="text-xs text-slate-500">{opt.sub}</div>
              )}
            </div>
            <span
              className={cn(
                'h-5 w-5 rounded-full border-2 transition-all',
                selected
                  ? 'border-pogo-500 bg-pogo-500 ring-4 ring-pogo-500/20'
                  : 'border-slate-300',
              )}
            />
          </button>
        );
      })}
      {studentDisabled && (
        <p className="text-xs text-red-600">
          Solde insuffisant sur la carte étudiant pour cette durée.
        </p>
      )}
    </div>
  );
}
