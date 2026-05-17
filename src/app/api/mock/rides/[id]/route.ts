import { fail, ok, simulateLatency } from '@/lib/mock/respond';
import { store } from '@/lib/mock/store';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: { id: string };
}

/** GET /api/mock/rides/:id — single ride by ID. */
export async function GET(_request: Request, { params }: RouteContext) {
  await simulateLatency();
  const ride = store.rides.find((r) => r.id === params.id);
  if (!ride) return fail(404, 'RIDE_NOT_FOUND', 'Course introuvable');
  return ok(ride);
}
