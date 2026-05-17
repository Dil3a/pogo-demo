import { ok, simulateLatency } from '@/lib/mock/respond';
import { store } from '@/lib/mock/store';

export const dynamic = 'force-dynamic';

/** GET /api/mock/wallet — balance + recent transactions. */
export async function GET() {
  await simulateLatency();
  return ok({
    balanceCentimes: store.user.walletBalanceCentimes,
    transactions: store.transactions.slice(0, 20),
  });
}
