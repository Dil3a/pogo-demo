'use client';

import { useEffect, useState } from 'react';
import { getClientStore } from '@/lib/client-store';
import type { Scooter, Station } from '@/types/domain';

export function useStations() {
  const store = getClientStore();
  const [data, setData] = useState<Station[]>(() => store.getStations());
  useEffect(() => store.subscribe(() => setData(store.getStations())), [store]);
  return { data, isLoading: false, error: null };
}

export function useScooters(status?: 'available' | 'occupied' | 'charging') {
  const store = getClientStore();
  const [data, setData] = useState<Scooter[]>(() => store.getScooters(status));
  useEffect(() => store.subscribe(() => setData(store.getScooters(status))), [store, status]);
  return { data, isLoading: false, error: null };
}

export function useScooter(id: string | null) {
  const store = getClientStore();
  const [data, setData] = useState(() => id ? store.scooters.find((s) => s.id === id) : null);
  useEffect(() => store.subscribe(() => setData(id ? store.scooters.find((s) => s.id === id) ?? null : null)), [store, id]);
  return { data, isLoading: false, error: null };
}

export const stationsQueryKey = ['stations'] as const;
export const scootersQueryKey = (status?: string) => ['scooters', status ?? 'all'] as const;
