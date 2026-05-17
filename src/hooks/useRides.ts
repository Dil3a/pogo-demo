'use client';

import { useState, useCallback } from 'react';
import { getClientStore } from '@/lib/client-store';
import type { Ride, Uuid } from '@/types/domain';

export const ridesQueryKey = ['rides'] as const;
export const rideQueryKey = (id: string) => ['ride', id] as const;

export function useRideHistory() {
  const store = getClientStore();
  const [data, setData] = useState<Ride[]>(() => [...store.rides]);
  useState(() => store.subscribe(() => setData([...store.rides])));
  return { data, isLoading: false, error: null };
}

export function useRide(id: Uuid | null) {
  const store = getClientStore();
  const [data, setData] = useState<Ride | undefined>(() =>
    id ? store.rides.find((r) => r.id === id) : undefined
  );
  useState(() => store.subscribe(() =>
    setData(id ? store.rides.find((r) => r.id === id) : undefined)
  ));
  return { data, isLoading: false, error: null };
}

export function useCreateRide() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = useCallback(async (input: {
    scooterId: string;
    durationHours: 1 | 2 | 4;
    paymentMethodId: string;
    idempotencyKey: string;
  }): Promise<Ride> => {
    setIsPending(true);
    setError(null);
    try {
      // Small delay to show loading state
      await new Promise((r) => setTimeout(r, 300));
      const ride = getClientStore().createRide(
        input.scooterId,
        input.durationHours,
        input.paymentMethodId,
      );
      return ride;
    } catch (e) {
      const err = e instanceof Error ? e : new Error('Erreur inconnue');
      setError(err);
      throw err;
    } finally {
      setIsPending(false);
    }
  }, []);

  return { mutateAsync, isPending, error };
}

export function useUnlockRide() {
  const [isPending, setIsPending] = useState(false);

  const mutate = useCallback(async (
    input: { rideId: string; idempotencyKey: string; rideData?: Record<string, unknown> },
    options?: { onSuccess?: (ride: Ride) => void; onError?: (e: Error) => void }
  ) => {
    setIsPending(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      const ride = getClientStore().unlockRide(input.rideId);
      options?.onSuccess?.(ride);
    } catch (e) {
      options?.onError?.(e instanceof Error ? e : new Error('Erreur'));
    } finally {
      setIsPending(false);
    }
  }, []);

  return { mutate, isPending };
}

export function useEndRide() {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = useCallback(async (input: {
    rideId: string;
    rideData?: Record<string, unknown>;
  }): Promise<Ride> => {
    setIsPending(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      return getClientStore().endRide(input.rideId);
    } finally {
      setIsPending(false);
    }
  }, []);

  return { mutateAsync, isPending };
}
