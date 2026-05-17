import { ok, simulateLatency } from '@/lib/mock/respond';
import { store } from '@/lib/mock/store';

export const dynamic = 'force-dynamic';

/**
 * GET /api/mock/me
 *
 * Returns the currently signed-in user. In production this validates the session
 * cookie and looks up the user; in mock mode we always return the seeded student.
 */
export async function GET() {
  await simulateLatency();
  return ok(store.user);
}
