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
"use client"

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      // Handle OAuth callback - for now just redirect to home
      router.push('/map');
    }
  }, [searchParams, router]);

  return <div style={{ textAlign: 'center', padding: '40px' }}>Processing callback...</div>;
}