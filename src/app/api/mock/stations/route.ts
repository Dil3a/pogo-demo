import { ok, simulateLatency } from '@/lib/mock/respond';
import { store } from '@/lib/mock/store';

export const dynamic = 'force-dynamic';

/** GET /api/mock/stations — list all stations with live available counts. */
export async function GET() {
  await simulateLatency();
  // Recompute availableCount from the scooters table so it's never stale.
  const stations = store.stations.map((s) => ({
    ...s,
    availableCount: store.scooters.filter(
      (sc) => sc.stationId === s.id && sc.status === 'available',
    ).length,
  }));
  return ok(stations);
}
