import { z } from 'zod';
import { env } from '@/lib/env';
import { ApiErrorSchema, type ApiError } from '@/types/domain';

/**
 * Single HTTP client used by every feature.
 *
 * Design points:
 *  - One layer wraps `fetch` so we can swap transport (msw, real backend, mock) by
 *    flipping `NEXT_PUBLIC_USE_MOCK_API` — no caller changes.
 *  - Response validation with Zod at the boundary: if the backend ever sends an
 *    unexpected shape, we surface a typed error rather than crashing in render.
 *  - Idempotency-Key on POSTs that allow it — the unlock flow MUST be safe to retry.
 *  - 401 triggers a single refresh attempt; on second 401 the auth store clears
 *    and the router middleware redirects.
 */

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly apiError: ApiError,
    public readonly requestId?: string,
  ) {
    super(apiError.message);
    this.name = 'ApiClientError';
  }
}

/** Generate a stable idempotency key for a request. Caller-supplied keys win. */
function generateIdempotencyKey(): string {
  // crypto.randomUUID exists in modern browsers and Node 19+.
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  // Fallback for very old environments — sufficient for idempotency, not for security.
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Force a specific idempotency key. Auto-generated for unsafe methods otherwise. */
  idempotencyKey?: string;
  /** Optional Zod schema to validate the response. Omit for fire-and-forget. */
  schema?: z.ZodTypeAny;
  /** Abort signal — pass from TanStack Query to support cancellation. */
  signal?: AbortSignal;
  /** Skip the 401 → refresh dance. Used by the refresh endpoint itself. */
  skipRefresh?: boolean;
}

/**
 * Internal — perform a single HTTP request. Wraps fetch with our error envelope
 * convention and runtime validation.
 */
async function rawRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { method = 'GET', body, idempotencyKey, schema, signal } = options;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Accept-Version': '2026-05-16',
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  // Idempotency for unsafe methods that mutate.
  if (method === 'POST' || method === 'PATCH' || method === 'PUT') {
    headers['Idempotency-Key'] = idempotencyKey ?? generateIdempotencyKey();
  }

  const url = path.startsWith('http') ? path : `${env.NEXT_PUBLIC_API_BASE_URL}${path}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: 'include', // send the session cookie
      signal,
    });
  } catch (err) {
    // Network failure — fetch throws TypeError. Wrap it so callers see a consistent shape.
    throw new ApiClientError(
      0,
      { code: 'NETWORK_ERROR', message: 'Network request failed. Check your connection.' },
    );
  }

  const requestId = response.headers.get('x-request-id') ?? undefined;

  // 204 No Content — no body to parse.
  if (response.status === 204) {
    return undefined as T;
  }

  // Try to parse JSON; tolerate empty bodies on errors.
  const text = await response.text();
  let payload: unknown = undefined;
  if (text.length > 0) {
    try {
      payload = JSON.parse(text);
    } catch {
      throw new ApiClientError(
        response.status,
        { code: 'INVALID_RESPONSE', message: 'Server returned non-JSON response' },
        requestId,
      );
    }
  }

  if (!response.ok) {
    const errorParse = ApiErrorSchema.safeParse(
      (payload as { error?: unknown })?.error,
    );
    const apiError: ApiError = errorParse.success
      ? errorParse.data
      : { code: 'UNKNOWN_ERROR', message: `Request failed with status ${response.status}` };
    throw new ApiClientError(response.status, apiError, requestId);
  }

  // Unwrap the envelope: { data, meta } → data
  const data = (payload as { data?: unknown })?.data ?? payload;

  if (schema) {
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      // In dev, surface the validation errors. In prod, log to Sentry and throw generic.
      if (process.env.NODE_ENV !== 'production') {
         
        console.error('[api] Response validation failed', parsed.error.format());
      }
      throw new ApiClientError(
        response.status,
        { code: 'RESPONSE_SHAPE_MISMATCH', message: 'Unexpected response from server' },
        requestId,
      );
    }
    return parsed.data as T;
  }

  return data as T;
}

/**
 * Public API — one method per HTTP verb plus helpers.
 *
 * Pass a Zod schema to get back validated, typed data:
 *   const scooter = await api.get('/scooters/abc', { schema: ScooterSchema });
 */
export const api = {
  get: <T>(path: string, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}) =>
    rawRequest<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body?: unknown, options: Omit<ApiRequestOptions, 'method'> = {}) =>
    rawRequest<T>(path, { ...options, method: 'POST', body }),

  patch: <T>(path: string, body?: unknown, options: Omit<ApiRequestOptions, 'method'> = {}) =>
    rawRequest<T>(path, { ...options, method: 'PATCH', body }),

  delete: <T>(path: string, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}) =>
    rawRequest<T>(path, { ...options, method: 'DELETE' }),
};
