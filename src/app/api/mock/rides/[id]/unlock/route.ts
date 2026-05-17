import { fail, ok, simulateLatency, withIdempotency } from '@/lib/mock/respond';
import { store } from '@/lib/mock/store';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: { id: string };
}

/**
 * POST /api/mock/rides/:id/unlock
 *
 * Sends the unlock command to the scooter. In production:
 *   1. Publish MQTT command `pogo/scooter/{deviceId}/cmd { type: 'unlock', ... }`.
 *   2. Wait up to 30s for `pogo/scooter/{deviceId}/ack`.
 *   3. On ack, transition ride: reserved → active. Notify client via WebSocket.
 *   4. On timeout, cancel the ride and refund.
 *
 * In this mock:
 *   - 90% success rate (you'll see the rare failure path during testing).
 *   - Simulated 800ms hardware delay.
 *   - On success: ride status → 'active', refund nothing.
 *   - On failure: ride status → 'cancelled', wallet refunded.
 */
export async function POST(request: Request, { params }: RouteContext) {
  const idempotencyKey = request.headers.get('idempotency-key');

  return withIdempotency(idempotencyKey, async () => {
    await simulateLatency(600, 1200); // "scooter is unlocking..."

    const ride = store.rides.find((r) => r.id === params.id);
    if (!ride) return fail(404, 'RIDE_NOT_FOUND', 'Course introuvable');

    if (ride.status === 'active') {
      // Idempotent success — already unlocked.
      return ok(ride);
    }
    if (ride.status !== 'reserved' && ride.status !== 'unlocking') {
      return fail(409, 'INVALID_RIDE_STATE', `Cannot unlock from status: ${ride.status}`);
    }

    // Simulate hardware: 90% success.
    const success = Math.random() < 0.9;

    if (success) {
      ride.status = 'active';
      ride.startedAt = new Date().toISOString();
      return ok(ride);
    } else {
      ride.status = 'cancelled';
      const scooter = store.scooters.find((s) => s.id === ride.scooterId);
      if (scooter) {
        scooter.status = 'available';
        // Snap back to last known station.
        const station = store.stations[0];
        if (station) {
          scooter.stationId = station.id;
          scooter.stationLabel = station.label;
        }
      }
      // Refund.
      store.user.walletBalanceCentimes += ride.amountCentimes;
      store.transactions.unshift({
        id: crypto.randomUUID(),
        amountCentimes: ride.amountCentimes,
        reason: `Remboursement automatique (déverrouillage échoué) — ${ride.reference}`,
        createdAt: new Date().toISOString(),
        relatedRideReference: ride.reference,
      });
      return fail(502, 'UNLOCK_FAILED', 'La trottinette n\u2019a pas répondu. Vous avez été remboursé.');
    }
  });
}
