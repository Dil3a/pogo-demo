import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/mock/auth/logout
 * Clears the session cookie. No body.
 */
export async function POST() {
  cookies().delete('pogo_session');
  return new NextResponse(null, { status: 204 });
}
