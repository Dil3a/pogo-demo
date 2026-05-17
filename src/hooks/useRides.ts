'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rides, type CreateRideInput } from '@/lib/api/endpoints';
import type { Ride, Uuid } from '@/types/domain';
import { scootersQueryKey } from './useScooters';

export const ridesQueryKey = ['rides'] as const;
export const rideQueryKey = (id: string) => ['ride', id] as const;

/** History list. */
export function useRideHistory() {
  return useQuery({
    queryKey: ridesQueryKey,
    queryFn: rides.list,
    staleTime: 30 * 1000,
  });
}

/** Single ride — polls while active. */
export function useRide(id: Uuid | null) {
  return useQuery({
    queryKey: rideQueryKey(id ?? ''),
    queryFn: () => rides.get(id!),
    enabled: !!id,
    // Poll while ride is in a transient state. Real backend pushes via WS.
    refetchInterval: (q) => {
      const data = q.state.data as Ride | undefined;
      if (!data) return false;
      const isTransient = data.status === 'reserved' || data.status === 'unlocking' || data.status === 'active';
      return isTransient ? 3000 : false;
    },
  });
}

/** Create reservation. Uses the caller-supplied idempotency key. */
export function useCreateRide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRideInput & { idempotencyKey: string }) =>
      rides.create({ scooterId: input.scooterId, durationHours: input.durationHours, paymentMethodId: input.paymentMethodId }, input.idempotencyKey),
    onSuccess: () => {
      // Scooter list is now stale.
      qc.invalidateQueries({ queryKey: ['scooters'] });
      qc.invalidateQueries({ queryKey: ridesQueryKey });
      qc.invalidateQueries({ queryKey: ['wallet'] });
      qc.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

/** Unlock ride. Same idempotency key as create. */
export function useUnlockRide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ rideId, idempotencyKey }: { rideId: Uuid; idempotencyKey: string }) =>
      rides.unlock(rideId, idempotencyKey),
    onSuccess: (updatedRide) => {
      qc.setQueryData(rideQueryKey(updatedRide.id), updatedRide);
      qc.invalidateQueries({ queryKey: scootersQueryKey() });
    },
    onError: () => {
      // On unlock failure the backend has already refunded; invalidate wallet.
      qc.invalidateQueries({ queryKey: ['wallet'] });
      qc.invalidateQueries({ queryKey: ['scooters'] });
    },
  });
}

/** End an active ride. */
export function useEndRide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rideId: Uuid) => rides.end(rideId),
    onSuccess: (updatedRide) => {
      qc.setQueryData(rideQueryKey(updatedRide.id), updatedRide);
      qc.invalidateQueries({ queryKey: ridesQueryKey });
      qc.invalidateQueries({ queryKey: ['scooters'] });
    },
  });
}
