import { ok, simulateLatency } from '@/lib/mock/respond';
import { store } from '@/lib/mock/store';
import { ScooterStatusSchema } from '@/types/domain';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  await simulateLatency(0, 50);
  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get('status');
  const status = statusParam ? ScooterStatusSchema.safeParse(statusParam) : null;

  let scooters = store.scooters;
  if (status?.success) {
    scooters = scooters.filter((s) => s.status === status.data);
  }
  const response = ok(scooters);
  response.headers.set('Cache-Control', 's-maxage=5, stale-while-revalidate=15');
  return response;
}
