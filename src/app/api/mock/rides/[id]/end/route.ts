import { fail, ok, simulateLatency } from '@/lib/mock/respond';
import { store } from '@/lib/mock/store';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: { id: string };
}

/**
 * POST /api/mock/rides/:id/end
 *
 * Ends an active ride. The scooter is parked at its nearest station (mocked
 * as the first available station). In production, the scooter publishes a
 * lock event when the user manually re-locks it.
 */
export async function POST(_request: Request, { params }: RouteContext) {
  await simulateLatency();
  const ride = store.rides.find((r) => r.id === params.id);
  if (!ride) return fail(404, 'RIDE_NOT_FOUND', 'Course introuvable');
  if (ride.status !== 'active') {
    return fail(409, 'INVALID_RIDE_STATE', 'Cette course n\u2019est pas active');
  }

  ride.status = 'completed';
  ride.endedAt = new Date().toISOString();

  const scooter = store.scooters.find((s) => s.id === ride.scooterId);
  if (scooter) {
    // Mock: return scooter to its starting station (or first active station).
    const station = store.stations.find((s) => s.isActive);
    scooter.status = 'available';
    if (station) {
      scooter.stationId = station.id;
      scooter.stationLabel = station.label;
      scooter.lat = station.lat;
      scooter.lng = station.lng;
      ride.endStationLabel = station.label;
    }
  }

  return ok(ride);
}
