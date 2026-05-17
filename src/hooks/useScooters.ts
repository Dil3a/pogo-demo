'use client';

import { useQuery } from '@tanstack/react-query';
import { fleet } from '@/lib/api/endpoints';
import type { ScooterStatus } from '@/types/domain';

export const stationsQueryKey = ['stations'] as const;
export const scootersQueryKey = (status?: ScooterStatus) =>
  ['scooters', status ?? 'all'] as const;

export function useStations() {
  return useQuery({
    queryKey: stationsQueryKey,
    queryFn: fleet.listStations,
    staleTime: 30 * 1000,       // cache 30s
    gcTime: 5 * 60 * 1000,      // keep in memory 5min
    refetchOnWindowFocus: false,
  });
}

export function useScooters(status?: 'available' | 'occupied' | 'charging') {
  return useQuery({
    queryKey: scootersQueryKey(status),
    queryFn: () => fleet.listScooters(status ? { status } : undefined),
    staleTime: 10 * 1000,
    gcTime: 2 * 60 * 1000,
    refetchInterval: 30 * 1000,  // reduced from 15s to 30s
    refetchOnWindowFocus: false,
  });
}

export function useScooter(idOrCode: string | null) {
  return useQuery({
    queryKey: ['scooter', idOrCode],
    queryFn: () => fleet.getScooter(idOrCode!),
    enabled: !!idOrCode,
    staleTime: 5 * 1000,
    refetchOnWindowFocus: false,
  });
}
