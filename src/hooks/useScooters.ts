'use client';

import { useQuery } from '@tanstack/react-query';
import { fleet } from '@/lib/api/endpoints';
import type { ScooterStatus } from '@/types/domain';

export const stationsQueryKey = ['stations'] as const;
export const scootersQueryKey = (status?: ScooterStatus) =>
  ['scooters', status ?? 'all'] as const;

/** All stations with live available counts. Cached longer — stations are static. */
export function useStations() {
  return useQuery({
    queryKey: stationsQueryKey,
    queryFn: fleet.listStations,
    staleTime: 60 * 1000, // 1 minute
  });
}

/** All scooters, optionally filtered by status. */
export function useScooters(status?: 'available' | 'occupied' | 'charging') {
  return useQuery({
    queryKey: scootersQueryKey(status),
    queryFn: () => fleet.listScooters(status ? { status } : undefined),
    // Short staleTime — availability changes constantly. Real backend pushes via WS.
    staleTime: 5 * 1000,
    refetchInterval: 15 * 1000, // poll fallback when WS is off
  });
}

/** Single scooter (UUID or code). */
export function useScooter(idOrCode: string | null) {
  return useQuery({
    queryKey: ['scooter', idOrCode],
    queryFn: () => fleet.getScooter(idOrCode!),
    enabled: !!idOrCode,
  });
}
