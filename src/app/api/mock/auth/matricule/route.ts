import { z } from 'zod';
import { cookies } from 'next/headers';
import { fail, ok, simulateLatency } from '@/lib/mock/respond';
import { store } from '@/lib/mock/store';
import { MatriculeSchema } from '@/types/domain';

export const dynamic = 'force-dynamic';

const BodySchema = z.object({
  matricule: MatriculeSchema,
});

/**
 * POST /api/mock/auth/matricule
 *
 * Fallback login (the SSO path goes to /auth/sso/initiate). Accepts a 7-digit
 * matricule, validates it, and sets a session cookie. In production this would
 * also require an OTP step.
 */
export async function POST(request: Request) {
  await simulateLatency(150, 400);
  const body = await request.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return fail(400, 'INVALID_INPUT', 'Le numéro matricule doit contenir 7 chiffres');
  }

  // Mock: any 7-digit matricule is accepted; we keep returning the seeded user.
  // The cookie is opaque — in real life it'd be a JWT or a session reference.
  cookies().set('pogo_session', `mock_${parsed.data.matricule}`, {
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    // secure: true, // in production over HTTPS
  });

  return ok(store.user);
}
