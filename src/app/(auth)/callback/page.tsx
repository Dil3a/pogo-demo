'use client';

/**
 * SSO callback — placeholder route.
 *
 * In production the UEMF Identity Provider redirects here with a SAML/OIDC
 * artefact. The backend exchanges it for our session cookie, then we redirect
 * to the originally requested destination (`?next=...`).
 *
 * For now this is a stub that just bounces to /map. See ARCHITECTURE.md §6
 * for the full SSO sequence diagram.
 */

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function CallbackPage() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const next = params.get('next') ?? '/map';
    // In real impl: POST artefact to /api/auth/sso/callback, then router.replace(next).
    const t = setTimeout(() => router.replace(next), 600);
    return () => clearTimeout(t);
  }, [router, params]);

  return (
    <div className="flex min-h-dvh items-center justify-center text-slate-600">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-7 w-7 animate-spin text-pogo-500" />
        <p className="text-sm">Connexion en cours…</p>
      </div>
    </div>
  );
}
