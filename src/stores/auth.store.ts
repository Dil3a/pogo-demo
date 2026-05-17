import { create } from 'zustand';
import type { User } from '@/types/domain';

/**
 * Auth store.
 *
 * Why Zustand for auth, not React Query:
 *   - The current user is consumed by ~every component; React Query's hook-only
 *     access pattern is awkward for non-component code (e.g. the API client itself).
 *   - We still fetch the user via React Query (`useMe`) and mirror it into this
 *     store on success — best of both worlds.
 *   - Tokens in memory only. Never localStorage (XSS-exposed) and never sessionStorage
 *     (same problem). The session cookie is the source of truth.
 */

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clear: () => set({ user: null }),
}));

/** Selector hook — narrow re-renders to user identity. */
export const useCurrentUser = () => useAuthStore((s) => s.user);
