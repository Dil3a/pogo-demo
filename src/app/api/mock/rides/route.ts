import { z } from 'zod';
import { NextResponse } from 'next/server';
import { fail, ok, simulateLatency } from '@/lib/mock/respond';
import { getRateForHours, store } from '@/lib/mock/store';
import { DurationBucketSchema, UuidSchema, type Ride } from '@/types/domain';

export const dynamic = 'force-dynamic';

const BodySchema = z.object({
  scooterId: UuidSchema,
  durationHours: DurationBucketSchema,
  paymentMethodId: UuidSchema,
});

/**
 * POST /api/mock/rides
 * Reserves a scooter and authorizes payment.
 */
export async function POST(request: Request) {
  await simulateLatency(50, 150);

  const body = await request.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return fail(400, 'INVALID_INPUT', 'Données de réservation invalides');
  }
  const { scooterId, durationHours, paymentMethodId } = parsed.data;

  const scooter = store.scooters.find((s) => s.id === scooterId);
  if (!scooter) return fail(404, 'SCOOTER_NOT_FOUND', 'Trottinette introuvable');
  if (scooter.status !== 'available') {
    return fail(409, 'SCOOTER_UNAVAILABLE', 'Cette trottinette n\u2019est plus disponible');
  }

  const method = store.paymentMethods.find((m) => m.id === paymentMethodId);
  if (!method) return fail(404, 'PAYMENT_METHOD_NOT_FOUND', 'Mode de paiement introuvable');

  const amountCentimes = getRateForHours(durationHours);

  if (method.type === 'student_card') {
    if (store.user.walletBalanceCentimes < amountCentimes) {
      return fail(402, 'INSUFFICIENT_FUNDS', 'Solde carte étudiant insuffisant');
    }
    store.user.walletBalanceCentimes -= amountCentimes;
    store.transactions.unshift({
      id: crypto.randomUUID(),
      amountCentimes: -amountCentimes,
      reason: `Réservation trottinette ${scooter.code} (${durationHours}h)`,
      createdAt: new Date().toISOString(),
      relatedRideReference: null,
    });
  }

  const now = new Date();
  const expires = new Date(now.getTime() + durationHours * 3600 * 1000);
  const ride: Ride = {
    id: crypto.randomUUID(),
    reference: `TRT-${Date.now()}`,
    userId: store.user.id,
    scooterId: scooter.id,
    scooterCode: scooter.code,
    startStationLabel: scooter.stationLabel ?? 'Inconnu',
    endStationLabel: null,
    status: 'reserved',
    durationHours,
    amountCentimes,
    reservedAt: now.toISOString(),
    startedAt: null,
    endedAt: null,
    expiresAt: expires.toISOString(),
  };

  scooter.status = 'occupied';
  scooter.stationId = null;
  store.rides.unshift(ride);

  const lastTxn = store.transactions[0];
  if (lastTxn && lastTxn.relatedRideReference === null) {
    lastTxn.relatedRideReference = ride.reference;
  }

  return NextResponse.json({
    data: ride,
    meta: { requestId: 'req_mock', timestamp: new Date().toISOString() },
  }, { status: 201 });
}

/** GET /api/mock/rides — list rides for the current user, newest first. */
export async function GET() {
  await simulateLatency(50, 100);
  const rides = store.rides.filter((r) => r.userId === store.user.id);
  return ok(rides);
}
