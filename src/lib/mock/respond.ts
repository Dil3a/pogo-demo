import { NextResponse } from 'next/server';
import { store } from './store';

/**
 * Helpers shared by every mock route handler.
 *
 * Keeps the envelope shape (`{ data, meta }`) and error shape (`{ error, meta }`)
 * consistent — this is what the real backend MUST emit, so the frontend's API
 * client treats mock and prod responses identically.
 */

function requestId(): string {
  return `req_${Math.random().toString(36).slice(2, 12)}`;
}

export function ok<T>(data: T, extra?: { nextCursor?: string | null }) {
  return NextResponse.json({
    data,
    meta: {
      requestId: requestId(),
      timestamp: new Date().toISOString(),
      ...(extra?.nextCursor !== undefined ? { nextCursor: extra.nextCursor } : {}),
    },
  });
}

export function fail(
  status: number,
  code: string,
  message: string,
  details?: Record<string, unknown>,
) {
  return NextResponse.json(
    {
      error: { code, message, ...(details ? { details } : {}) },
      meta: { requestId: requestId(), timestamp: new Date().toISOString() },
    },
    { status },
  );
}

/**
 * Look up a cached response by idempotency key. If present, return it directly.
 * If not, execute `compute()` and cache its result for 24h.
 *
 * Mock-only — the real backend uses Redis with proper TTL and key namespacing.
 */
export async function withIdempotency<T extends Response>(
  key: string | null,
  compute: () => Promise<T>,
): Promise<T> {
  if (!key) {
    return compute();
  }
  const cached = store.idempotency.get(key);
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  if (cached && Date.now() - cached.at < TWENTY_FOUR_HOURS) {
    return cached.response as T;
  }
  const response = await compute();
  // Clone to read body without consuming the original stream.
  const cloned = response.clone();
  try {
    const json = await cloned.json();
    store.idempotency.set(key, { response: json, at: Date.now() });
  } catch {
    // Non-JSON response — skip caching.
  }
  return response;
}

/** Simulate network latency in dev so we can see loading states. */
export async function simulateLatency(min = 0, max = 50): Promise<void> {
  if (process.env.NODE_ENV === 'production') return;
  const ms = min + Math.random() * (max - min);
  await new Promise((r) => setTimeout(r, ms));
}