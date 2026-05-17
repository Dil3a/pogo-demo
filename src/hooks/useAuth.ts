'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { auth } from '@/lib/api/endpoints';
import { useAuthStore } from '@/stores/auth.store';
import { ApiClientError } from '@/lib/api/client';

export const meQueryKey = ['me'] as const;

/**
 * Fetch the current user.
 *
 * On success the user is mirrored into the auth store so non-component code
 * (e.g. the WebSocket connector) can read it without a hook.
 */
export function useMe() {
  const setUser = useAuthStore((s) => s.setUser);
  const query = useQuery({
    queryKey: meQueryKey,
    queryFn: auth.me,
    // Don't retry on 401 — that's the signal to redirect to login.
    retry: (failureCount, error) => {
      if (error instanceof ApiClientError && error.status === 401) return false;
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mirror server state into client store.
  useEffect(() => {
    if (query.data) setUser(query.data);
    else if (query.error instanceof ApiClientError && query.error.status === 401) {
      setUser(null);
    }
  }, [query.data, query.error, setUser]);

  return query;
}

/** Matricule login mutation. Used by the fallback login form. */
export function useLoginWithMatricule() {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: auth.loginWithMatricule,
    onSuccess: (user) => {
      setUser(user);
      qc.setQueryData(meQueryKey, user);
    },
  });
}

/** Logout — clears server session, then local stores. */
export function useLogout() {
  const qc = useQueryClient();
  const clear = useAuthStore((s) => s.clear);

  return useMutation({
    mutationFn: auth.logout,
    onSettled: () => {
      clear();
      qc.clear();
    },
  });
}
