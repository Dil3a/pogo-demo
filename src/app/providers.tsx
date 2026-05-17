'use client';

/**
 * Providers — wraps the app in TanStack Query, Sonner (toasts), and any
 * future context providers.
 *
 * QueryClient is memoized via useState so it survives Fast Refresh in dev
 * without losing cached data.
 */

import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stations / rate cards rarely change — staleTime keeps the
            // network quiet during a typical 5-minute session.
            staleTime: 30 * 1000,
            retry: (failureCount, error) => {
              // Don't retry on 4xx — those errors are client-fixable.
              if (error instanceof Error && /^4\d{2}$/.test(error.message)) {
                return false;
              }
              return failureCount < 2;
            },
            refetchOnWindowFocus: false,
          },
          mutations: {
            // No retry: mutations are idempotent at the API level via
            // Idempotency-Key, so we let the user decide when to retry.
            retry: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontFamily: 'inherit',
            border: '1px solid #dde4f0',
          },
        }}
      />
    </QueryClientProvider>
  );
}
