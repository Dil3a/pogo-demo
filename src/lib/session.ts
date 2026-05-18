/**
 * Shared session store — persists across portal and POGO app.
 * Uses localStorage so login survives page refresh.
 */

export interface SessionUser {
  matricule: string;
  firstName: string;
  lastName: string;
  email: string;
  establishment: string;
  program: string;
  role: 'student' | 'admin';
}

const SESSION_KEY = 'uemf_session';

export function getSession(): SessionUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

export function setSession(user: SessionUser): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
}

export function isLoggedIn(): boolean {
  return getSession() !== null;
}
