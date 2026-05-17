import { create } from 'zustand';
import type { DurationBucket, PaymentMethodType, Scooter, Ride } from '@/types/domain';

interface RideState {
  selectedScooter: Scooter | null;
  durationHours: DurationBucket;
  paymentMethod: PaymentMethodType;
  idempotencyKey: string | null;
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

export const useRideStore = create<RideState>((set) => ({
  selectedScooter: null,
  durationHours: 1,
  paymentMethod: 'card',
  idempotencyKey: null,
  activeRide: null,

  selectScooter: (scooter) => set({ selectedScooter: scooter, idempotencyKey: newKey() }),
  setDuration: (durationHours) => set({ durationHours }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  setActiveRide: (ride) => set({ activeRide: ride }),
  regenerateIdempotencyKey: () => set({ idempotencyKey: newKey() }),
  // reset only clears the funnel — NOT activeRide
  reset: () => set({
    selectedScooter: null,
    durationHours: 1,
    paymentMethod: 'card',
    idempotencyKey: null,
  }),
}));
