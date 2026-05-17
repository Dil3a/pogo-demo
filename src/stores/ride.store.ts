import { create } from 'zustand';
import type { DurationBucket, PaymentMethodType, Scooter } from '@/types/domain';

/**
 * Ride store — ephemeral state for the active reservation funnel.
 *
 * Lifecycle:
 *   1. User scans QR or taps a scooter on the map → selectScooter().
 *   2. They pick duration and payment → setDuration() / setPaymentMethod().
 *   3. They confirm → createRide() mutation (handled in hooks).
 *   4. After unlock, the active ride moves to the server-state cache (React Query)
 *      and this store is reset.
 *
 * Why not put this in URL params? Because the QR scan is a side-channel and we
 * want the in-flight selection to survive route changes (scan → confirm → unlock).
 *
 * The idempotency key is generated the moment a scooter is selected and kept
 * through the entire funnel. If the user double-taps "Confirmer" or refreshes
 * mid-flow, the server returns the same Ride object instead of creating a duplicate.
 */

interface RideState {
  selectedScooter: Scooter | null;
  durationHours: DurationBucket;
  paymentMethod: PaymentMethodType;
  /** Idempotency key for the create-ride request. Generated on selectScooter. */
  idempotencyKey: string | null;

  selectScooter: (scooter: Scooter) => void;
  setDuration: (d: DurationBucket) => void;
  setPaymentMethod: (m: PaymentMethodType) => void;
  /** Regenerate the idempotency key — used if the user explicitly retries after a hard failure. */
  regenerateIdempotencyKey: () => void;
  reset: () => void;
}

function newKey(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const initial: Pick<
  RideState,
  'selectedScooter' | 'durationHours' | 'paymentMethod' | 'idempotencyKey'
> = {
  selectedScooter: null,
  durationHours: 1,
  paymentMethod: 'card',
  idempotencyKey: null,
};

export const useRideStore = create<RideState>((set) => ({
  ...initial,
  selectScooter: (scooter) =>
    set({
      selectedScooter: scooter,
      idempotencyKey: newKey(),
    }),
  setDuration: (durationHours) => set({ durationHours }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  regenerateIdempotencyKey: () => set({ idempotencyKey: newKey() }),
  reset: () => set(initial),
}));
