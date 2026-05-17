import { ok, simulateLatency } from '@/lib/mock/respond';
import { store } from '@/lib/mock/store';

export const dynamic = 'force-dynamic';

/** GET /api/mock/payment-methods — list current user's saved payment methods. */
export async function GET() {
  await simulateLatency();
  return ok(store.paymentMethods);
}
