'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, setSession, clearSession } from '@/lib/session';
import { getClientStore } from '@/lib/client-store';
import type { User } from '@/types/domain';

export function useMe() {
  const store = getClientStore();
  const [data, setData] = useState<User>(() => store.user);

  useEffect(() => {
    const session = getSession();
    if (session) {
      store.user.matricule = session.matricule;
      store.user.firstName = session.firstName;
      store.user.lastName = session.lastName;
      store.user.email = session.email;
      store.user.establishment = session.establishment;
      setData({ ...store.user });
    }
    const unsub = store.subscribe(() => setData({ ...store.user }));
    return () => { unsub(); };
  }, [store]);

  return { data, isLoading: false, error: null };
}

export function useLoginWithMatricule() {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = useCallback(async (matricule: string): Promise<User> => {
    setIsPending(true);
    try {
      await new Promise((r) => setTimeout(r, 300));
      if (!/^\d{7}$/.test(matricule)) {
        throw new Error('Le matricule doit comporter exactement 7 chiffres');
      }
      const user = getClientStore().login(matricule);
      setSession({
        matricule,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        establishment: user.establishment,
        program: user.program ?? '',
        role: user.role as 'student' | 'admin',
      });
      return user;
    } finally {
      setIsPending(false);
    }
  }, []);

  return { mutateAsync, isPending };
}

export function useLogout() {
  const router = useRouter();

  const mutate = useCallback(() => {
    clearSession();
    router.push('/login');
  }, [router]);

  return { mutate };
}
