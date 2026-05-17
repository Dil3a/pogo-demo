import { z } from 'zod';
import { fail, ok, simulateLatency } from '@/lib/mock/respond';
import { store } from '@/lib/mock/store';

export const dynamic = 'force-dynamic';

const BodySchema = z.object({
  signature: z.string().min(1),
});

interface RouteContext {
  params: { id: string };
}

/**
 * POST /api/mock/scooters/:code/scan
 *
 * Real implementation:
 *   1. Verify the signature is `HMAC-SHA256(scooterCode + keyVersion + issuedAt, secret)`.
 *   2. Check issuedAt is recent enough (replay protection).
 *   3. Check key version is current (sticker rotation support).
 *   4. Return scooter if available, 409 if not.
 *
 * Mock implementation:
 *   - Accepts any non-empty signature.
 *   - Returns 409 if scooter is not available (forces the user to find another).
 */
export async function POST(request: Request, { params }: RouteContext) {
  await simulateLatency(200, 600); // a bit of suspense after scanning
  const body = await request.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return fail(400, 'INVALID_QR_SIGNATURE', 'QR signature manquante ou invalide');
  }

  const scooter = store.scooters.find(
    (s) => s.code === params.id || s.id === params.id,
  );
  if (!scooter) {
    return fail(404, 'SCOOTER_NOT_FOUND', `Trottinette ${params.id} introuvable`);
  }

  if (scooter.status !== 'available') {
    return fail(409, 'SCOOTER_UNAVAILABLE', 'Cette trottinette n\u2019est plus disponible', {
      currentStatus: scooter.status,
    });
  }

  return ok(scooter);
}
