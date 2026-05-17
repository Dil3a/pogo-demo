import { ok, simulateLatency } from '@/lib/mock/respond';
import { store } from '@/lib/mock/store';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  await simulateLatency(0, 50);
  const stations = store.stations.map((s) => ({
    ...s,
    availableCount: store.scooters.filter(
      (sc) => sc.stationId === s.id && sc.status === 'available',
    ).length,
  }));
  const response = ok(stations);
  // Allow client to cache for 10s
  response.headers.set('Cache-Control', 's-maxage=10, stale-while-revalidate=30');
  return response;
}
