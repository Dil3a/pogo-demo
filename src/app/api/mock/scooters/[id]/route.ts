import { fail, ok, simulateLatency } from '@/lib/mock/respond';
import { store } from '@/lib/mock/store';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: { id: string };
}

/** GET /api/mock/scooters/:id — single scooter by UUID or by code (T-01). */
export async function GET(_request: Request, { params }: RouteContext) {
  await simulateLatency();
  const scooter = store.scooters.find(
    (s) => s.id === params.id || s.code === params.id,
  );
  if (!scooter) {
    return fail(404, 'SCOOTER_NOT_FOUND', `Scooter ${params.id} not found`);
  }
  return ok(scooter);
}
