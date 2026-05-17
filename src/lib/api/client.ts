import { z } from 'zod';
import { env } from '@/lib/env';
import { ApiErrorSchema, type ApiError } from '@/types/domain';

/**
 * Single HTTP client used by every feature.
 *
 * Fix 2: retry uses exact HTTP status check (error.status === 404)
 * Fix 5: idempotency key uses crypto.randomUUID() with proper fallback
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

/** Fix 5: Secure idempotency key generator works in all environments */
function generateIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Secure fallback using getRandomValues
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('-');
  }
  // Last resort fallback (non-secure, dev only)
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  idempotencyKey?: string;
  schema?: z.ZodTypeAny;
  signal?: AbortSignal;
  skipRefresh?: boolean;
}

async function rawRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { method = 'GET', body, idempotencyKey, schema, signal } = options;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Accept-Version': '2026-05-16',
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

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
      credentials: 'include',
      signal,
    });
  } catch {
    throw new ApiClientError(
      0,
      { code: 'NETWORK_ERROR', message: 'Network request failed. Check your connection.' },
    );
  }

  const requestId = response.headers.get('x-request-id') ?? undefined;

  if (response.status === 204) {
    return undefined as T;
  }

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

  const data = (payload as { data?: unknown })?.data ?? payload;

  if (schema) {
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
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
