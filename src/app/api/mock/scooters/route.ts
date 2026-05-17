import { ok, simulateLatency } from '@/lib/mock/respond';
import { store } from '@/lib/mock/store';
import { ScooterStatusSchema } from '@/types/domain';

export const dynamic = 'force-dynamic';

/**
 * GET /api/mock/scooters?status=available
 *
 * Filterable list. In the real backend this would also support cursor pagination
 * and bbox-based filtering for the map viewport.
 */
export async function GET(request: Request) {
  await simulateLatency();
  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get('status');
  const status = statusParam ? ScooterStatusSchema.safeParse(statusParam) : null;

  let scooters = store.scooters;
  if (status?.success) {
    scooters = scooters.filter((s) => s.status === status.data);
  }
  return ok(scooters);
}
