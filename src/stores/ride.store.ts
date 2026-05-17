import { create } from 'zustand';
import type { DurationBucket, PaymentMethodType, Scooter, Ride } from '@/types/domain';

/**
 * Ride store — ephemeral state for the active reservation funnel.
 * Also caches the active ride so the ride page doesn't need to refetch
 * from a potentially different serverless instance.
 */

interface RideState {
  selectedScooter: Scooter | null;
  durationHours: DurationBucket;
  paymentMethod: PaymentMethodType;
  idempotencyKey: string | null;
  /** Cache the created ride so /ride/[id] page doesn't need to refetch */
  activeRide: Ride | null;

  selectScooter: (scooter: Scooter) => void;
  setDuration: (d: DurationBucket) => void;
  setPaymentMethod: (m: PaymentMethodType) => void;
  setActiveRide: (ride: Ride) => void;
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
  'selectedScooter' | 'durationHours' | 'paymentMethod' | 'idempotencyKey' | 'activeRide'
> = {
  selectedScooter: null,
  durationHours: 1,
  paymentMethod: 'card',
  idempotencyKey: null,
  activeRide: null,
};

export const useRideStore = create<RideState>((set) => ({
  ...initial,
  selectScooter: (scooter) =>
    set({ selectedScooter: scooter, idempotencyKey: newKey() }),
  setDuration: (durationHours) => set({ durationHours }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  setActiveRide: (ride) => set({ activeRide: ride }),
  regenerateIdempotencyKey: () => set({ idempotencyKey: newKey() }),
  reset: () => set(initial),
}));
