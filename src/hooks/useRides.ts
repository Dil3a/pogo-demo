'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rides, type CreateRideInput } from '@/lib/api/endpoints';
import type { Ride, Scooter, Uuid } from '@/types/domain';
import { scootersQueryKey } from './useScooters';

export const ridesQueryKey = ['rides'] as const;
export const rideQueryKey = (id: string) => ['ride', id] as const;

export function useRideHistory() {
  return useQuery({
    queryKey: ridesQueryKey,
    queryFn: rides.list,
    staleTime: 30 * 1000,
  });
}

export function useRide(id: Uuid | null) {
  return useQuery({
    queryKey: rideQueryKey(id ?? ''),
    queryFn: () => rides.get(id!),
    enabled: !!id,
    refetchInterval: (q) => {
      const data = q.state.data as Ride | undefined;
      if (!data) return false;
      const isTransient = data.status === 'reserved' || data.status === 'unlocking' || data.status === 'active';
      return isTransient ? 3000 : false;
    },
  });
}

export function useCreateRide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRideInput & { idempotencyKey: string }) =>
      rides.create(
        { scooterId: input.scooterId, durationHours: input.durationHours, paymentMethodId: input.paymentMethodId },
        input.idempotencyKey,
      ),
    onSuccess: (ride) => {
      // Directly update the scooter status in cache — don't wait for refetch
      qc.setQueriesData<Scooter[]>(
        { queryKey: ['scooters'] },
        (old) => old?.map((s) =>
          s.id === ride.scooterId ? { ...s, status: 'occupied' as const, stationId: null } : s
        ),
      );
      qc.invalidateQueries({ queryKey: ridesQueryKey });
      qc.invalidateQueries({ queryKey: ['wallet'] });
      qc.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

export function useUnlockRide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ rideId, idempotencyKey, rideData }: { rideId: Uuid; idempotencyKey: string; rideData?: Record<string, unknown> }) =>
      rides.unlock(rideId, idempotencyKey, rideData),
    onSuccess: (updatedRide) => {
      qc.setQueryData(rideQueryKey(updatedRide.id), updatedRide);
      qc.invalidateQueries({ queryKey: scootersQueryKey() });
    },
    onError: () => {
      qc.invalidateQueries({ queryKey: ['wallet'] });
      qc.invalidateQueries({ queryKey: ['scooters'] });
      qc.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

export function useEndRide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ rideId, rideData }: { rideId: Uuid; rideData?: Record<string, unknown> }) =>
      rides.end(rideId, rideData),
    onSuccess: (updatedRide) => {
      qc.setQueryData(rideQueryKey(updatedRide.id), updatedRide);
      // Directly update scooter back to available in cache
      qc.setQueriesData<Scooter[]>(
        { queryKey: ['scooters'] },
        (old) => old?.map((s) =>
          s.id === updatedRide.scooterId ? { ...s, status: 'available' as const } : s
        ),
      );
      qc.invalidateQueries({ queryKey: ridesQueryKey });
      qc.invalidateQueries({ queryKey: ['scooters'] });
      qc.invalidateQueries({ queryKey: ['wallet'] });
      qc.invalidateQueries({ queryKey: ['me'] });
    },
  });
}
