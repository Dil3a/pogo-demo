import { ok, simulateLatency } from '@/lib/mock/respond';
import { store } from '@/lib/mock/store';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: { id: string };
}

export async function POST(request: Request, { params }: RouteContext) {
  await simulateLatency(100, 200);

  const ride = store.rides.find((r) => r.id === params.id);

  // If ride not found in store (different serverless instance),
  // construct a synthetic active ride from the URL params
  if (!ride) {
    const body = await request.json().catch(() => ({}));
    const syntheticRide = {
      id: params.id,
      reference: body.reference ?? `TRT-${Date.now()}`,
      userId: store.user.id,
      scooterId: body.scooterId ?? 'unknown',
      scooterCode: body.scooterCode ?? 'T-??',
      startStationLabel: body.startStationLabel ?? 'Campus UEMF',
      endStationLabel: null,
      status: 'active' as const,
      durationHours: body.durationHours ?? 1,
      amountCentimes: body.amountCentimes ?? 500,
      reservedAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
      endedAt: null,
      expiresAt: new Date(Date.now() + (body.durationHours ?? 1) * 3600000).toISOString(),
    };
    return NextResponse.json({
      data: syntheticRide,
      meta: { requestId: 'req_mock', timestamp: new Date().toISOString() },
    });
  }

  if (ride.status === 'active') return ok(ride);

  if (ride.status !== 'reserved' && ride.status !== 'unlocking') {
    // Return active anyway for demo purposes
    ride.status = 'active';
    ride.startedAt = new Date().toISOString();
    return ok(ride);
  }

  ride.status = 'active';
  ride.startedAt = new Date().toISOString();
  return ok(ride);
}
