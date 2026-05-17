'use client';

import { useEffect, useState } from 'react';
import { getClientStore } from '@/lib/client-store';
import type { PaymentMethod, WalletTransaction } from '@/types/domain';

export const paymentMethodsQueryKey = ['payment-methods'] as const;
export const walletQueryKey = ['wallet'] as const;

export function usePaymentMethods() {
  const store = getClientStore();
  const [data, setData] = useState<PaymentMethod[]>(() => [...store.paymentMethods]);
  useEffect(() => store.subscribe(() => setData([...store.paymentMethods])), [store]);
  return { data, isLoading: false, error: null };
}

export function useWallet() {
  const store = getClientStore();
  const [data, setData] = useState(() => store.getWallet());
  useEffect(() => store.subscribe(() => setData(store.getWallet())), [store]);
  return { data, isLoading: false, error: null };
}
