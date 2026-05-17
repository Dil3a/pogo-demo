'use client';

import { useEffect, useState, useCallback } from 'react';
import { getClientStore } from '@/lib/client-store';
import { useAuthStore } from '@/stores/auth.store';
import type { User } from '@/types/domain';

export function useMe() {
  const store = getClientStore();
  const [data, setData] = useState<User>(() => store.user);
  useEffect(() => { const unsub = store.subscribe(() => setData({ ...store.user })); return () => { unsub(); }; }, [store]);
  return { data, isLoading: false, error: null };
}

export function useLoginWithMatricule() {
  const { setUser, setAuthenticated } = useAuthStore();
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = useCallback(async (matricule: string): Promise<User> => {
    setIsPending(true);
    try {
      await new Promise((r) => setTimeout(r, 300));
      if (!/^\d{7}$/.test(matricule)) {
        throw new Error('Le matricule doit comporter exactement 7 chiffres');
      }
      const user = getClientStore().login(matricule);
      setUser(user);
      setAuthenticated(true);
      return user;
    } finally {
      setIsPending(false);
    }
  }, [setUser, setAuthenticated]);

  return { mutateAsync, isPending };
}

export function useLogout() {
  const { clearUser } = useAuthStore();

  const mutate = useCallback(() => {
    clearUser();
  }, [clearUser]);

  return { mutate };
}
