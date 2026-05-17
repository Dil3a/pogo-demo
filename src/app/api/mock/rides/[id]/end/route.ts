import { ok, simulateLatency } from '@/lib/mock/respond';
import { store } from '@/lib/mock/store';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: { id: string };
}

export async function POST(request: Request, { params }: RouteContext) {
  await simulateLatency(0, 100);

  const body = await request.json().catch(() => ({}));
  const ride = store.rides.find((r) => r.id === params.id);
  const station = store.stations.find((s) => s.isActive);

  // If ride not found (different serverless instance), construct completed ride from body
  if (!ride) {
    const completedRide = {
      id: params.id,
      reference: body.reference ?? `TRT-${Date.now()}`,
      userId: store.user.id,
      scooterId: body.scooterId ?? 'unknown',
      scooterCode: body.scooterCode ?? 'T-??',
      startStationLabel: body.startStationLabel ?? 'Campus UEMF',
      endStationLabel: station?.label ?? 'Entrée principale',
      status: 'completed' as const,
      durationHours: body.durationHours ?? 1,
      amountCentimes: body.amountCentimes ?? 500,
      reservedAt: body.reservedAt ?? new Date().toISOString(),
      startedAt: body.startedAt ?? new Date().toISOString(),
      endedAt: new Date().toISOString(),
      expiresAt: body.expiresAt ?? new Date().toISOString(),
    };
    return NextResponse.json({
      data: completedRide,
      meta: { requestId: 'req_mock', timestamp: new Date().toISOString() },
    });
  }

  ride.status = 'completed';
  ride.endedAt = new Date().toISOString();

  const scooter = store.scooters.find((s) => s.id === ride.scooterId);
  if (scooter && station) {
    scooter.status = 'available';
    scooter.stationId = station.id;
    scooter.stationLabel = station.label;
    scooter.lat = station.lat;
    scooter.lng = station.lng;
    ride.endStationLabel = station.label;
  }

  return ok(ride);
}
