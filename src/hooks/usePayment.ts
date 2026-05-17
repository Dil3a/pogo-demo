'use client';

import { useQuery } from '@tanstack/react-query';
import { payments } from '@/lib/api/endpoints';

export const paymentMethodsQueryKey = ['payment-methods'] as const;
export const walletQueryKey = ['wallet'] as const;

export function usePaymentMethods() {
  return useQuery({
    queryKey: paymentMethodsQueryKey,
    queryFn: payments.listMethods,
    staleTime: 0,
  });
}

export function useWallet() {
  return useQuery({
    queryKey: walletQueryKey,
    queryFn: payments.getWallet,
    staleTime: 0,
  });
}
