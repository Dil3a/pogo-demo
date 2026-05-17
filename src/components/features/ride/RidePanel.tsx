'use client';

/**
 * RidePanel — the reservation funnel as a bottom-sheet / dialog.
 *
 * Funnel structure:
 *   1. Pick a duration bucket
 *   2. Pick a payment method
 *   3. Review and confirm
 *
 * State is read from `useRideStore` (Zustand) — the same idempotency key flows
 * through `useCreateRide`, ensuring that double-tapping "Confirmer" does not
 * create two reservations or two wallet debits.
 */

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Modal } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { DurationPicker } from './DurationPicker';
import { PaymentMethodPicker } from '@/components/features/payment/PaymentMethodPicker';
import { useRideStore } from '@/stores/ride.store';
import { useWallet, usePaymentMethods } from '@/hooks/usePayment';
import { useCreateRide } from '@/hooks/useRides';
import { RATE_CARD } from '@/lib/mock/store';
import { formatMoney } from '@/lib/format/money';
import type { DurationBucket } from '@/types/domain';

export function RidePanel() {
  const router = useRouter();
  const {
    selectedScooter,
    durationHours,
    paymentMethod,
    idempotencyKey,
    setDuration,
    setPaymentMethod,
    reset,
  } = useRideStore();

  const { data: wallet } = useWallet();
  const { data: methods } = usePaymentMethods();
  const createRide = useCreateRide();

  const rateCard = useMemo(
    () =>
      RATE_CARD.map((r) => ({
        hours: r.hours as DurationBucket,
        priceCentimes: r.priceCentimes,
      })),
    [],
  );

  const amountCentimes = useMemo(() => {
    const bucket = rateCard.find((r) => r.hours === durationHours);
    return bucket?.priceCentimes ?? 0;
  }, [rateCard, durationHours]);

  if (!selectedScooter) return null;

  async function confirm() {
    if (!selectedScooter || !idempotencyKey) return;
    // Translate the chosen method type into the saved method's UUID.
    const method = methods?.find((m) => m.type === paymentMethod);
    if (!method) {
      toast.error('Mode de paiement introuvable. Réessayez.');
      return;
    }
    try {
      const ride = await createRide.mutateAsync({
        scooterId: selectedScooter.id,
        durationHours,
        paymentMethodId: method.id,
        idempotencyKey,
      });
      toast.success(`Réservation confirmée — ${selectedScooter.code}`);
      reset();
      router.push(`/ride/${ride.id}`);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : 'Impossible de réserver la trottinette.',
      );
    }
  }

  return (
    <Modal
      open={Boolean(selectedScooter)}
      onClose={reset}
      title={`Réserver ${selectedScooter.code}`}
      size="md"
    >
      <div className="flex flex-col gap-5">
        <div>
          <div className="mb-2 text-xs font-semibold text-slate-700">
            Durée
          </div>
          <DurationPicker
            rateCard={rateCard}
            value={durationHours}
            onChange={setDuration}
          />
        </div>

        <div>
          <div className="mb-2 text-xs font-semibold text-slate-700">
            Mode de paiement
          </div>
          <PaymentMethodPicker
            value={paymentMethod}
            walletBalanceCentimes={wallet?.balanceCentimes}
            amountCentimes={amountCentimes}
            onChange={setPaymentMethod}
          />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
          <span className="text-sm font-semibold text-slate-700">
            Total à régler
          </span>
          <span className="text-xl font-black text-pogo-700">
            {formatMoney(amountCentimes)}
          </span>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" fullWidth onClick={reset}>
            Annuler
          </Button>
          <Button
            variant="uemf"
            fullWidth
            loading={createRide.isPending}
            onClick={confirm}
          >
            Confirmer
          </Button>
        </div>
      </div>
    </Modal>
  );
}
