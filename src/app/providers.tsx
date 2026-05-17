'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ApiClientError } from '@/lib/api/client';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Fix 2: Check exact HTTP status instead of substring search
        retry: (failureCount, error: unknown) => {
          if (error instanceof ApiClientError) {
            // Never retry client errors (4xx) - they won't succeed on retry
            if (error.status >= 400 && error.status < 500) return false;
            // Retry server errors (5xx) up to 2 times
            return failureCount < 2;
          }
          // Retry network errors up to 2 times
          return failureCount < 2;
        },
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
        refetchOnWindowFocus: false,
        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    return makeQueryClient();
  }
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-center"
        richColors
        closeButton
        duration={3000}
      />
    </QueryClientProvider>
  );
}
