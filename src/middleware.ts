import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware — authentication is handled client-side via Zustand auth store.
 * This middleware is a no-op in demo mode.
 */
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
