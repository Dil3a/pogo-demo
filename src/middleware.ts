import { NextResponse, type NextRequest } from 'next/server';

/**
 * Route protection middleware.
 *
 * Strategy: cookie-presence check. The session cookie (`pogo_session`) is set
 * by the login endpoint as HttpOnly + Secure + SameSite=Lax. We do NOT decode
 * it here — verification happens on the API side. The middleware exists only
 * to bounce unauthenticated users away from protected UI routes so they don't
 * see a flash of empty content.
 *
 * Protected: /map, /scan, /ride/*, /history, /wallet, /profile, /admin/*
 * Public:    /, /login, /callback, /api/*  (auth API routes need to be reachable)
 *
 * Why not Edge middleware with JWT verification? Because the JWT is signed by
 * the backend (NestJS) with a key the Next.js process doesn't necessarily share.
 * Defence-in-depth happens server-side on every API call.
 */

const PROTECTED_PREFIXES = [
  '/map',
  '/scan',
  '/ride',
  '/history',
  '/wallet',
  '/profile',
  '/admin',
];

const AUTH_ROUTES = ['/login', '/callback'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = req.cookies.get('pogo_session')?.value;

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  // Unauthenticated → bounce to login (preserve intended destination).
  if (isProtected && !session) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // Already authenticated → don't show login form again.
  if (isAuthRoute && session) {
    const url = req.nextUrl.clone();
    url.pathname = '/map';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Run on all paths except _next, static assets, and the mock API itself
  // (the API handles its own auth and would otherwise loop on redirects).
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/mock).*)'],
};
