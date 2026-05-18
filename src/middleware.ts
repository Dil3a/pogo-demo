import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/portail', '/attestation', '/api'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check session cookie (set by login page)
  const session = request.cookies.get('uemf_session');

  // For client-side session (localStorage), we can't check in middleware
  // So we let the app handle auth redirects client-side
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|sw.js|manifest.webmanifest).*)'],
};
