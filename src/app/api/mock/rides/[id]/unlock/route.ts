import { fail, ok, simulateLatency } from '@/lib/mock/respond';
import { store } from '@/lib/mock/store';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: { id: string };
}

/**
 * POST /api/mock/rides/:id/unlock
 * Always succeeds in demo mode with reduced latency.
 */
export async function POST(request: Request, { params }: RouteContext) {
  await simulateLatency(200, 400);

  const ride = store.rides.find((r) => r.id === params.id);
  if (!ride) return fail(404, 'RIDE_NOT_FOUND', 'Course introuvable');

  if (ride.status === 'active') {
    return ok(ride);
  }
  if (ride.status !== 'reserved' && ride.status !== 'unlocking') {
    return fail(409, 'INVALID_RIDE_STATE', `Cannot unlock from status: ${ride.status}`);
  }

  // Always succeed in demo mode
  ride.status = 'active';
  ride.startedAt = new Date().toISOString();
  return ok(ride);
}
