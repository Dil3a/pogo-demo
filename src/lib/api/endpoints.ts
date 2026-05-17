import { z } from 'zod';
import { api } from './client';
import {
  ScooterSchema,
  StationSchema,
  RideSchema,
  PaymentMethodSchema,
  UserSchema,
  WalletTransactionSchema,
  type Scooter,
  type Station,
  type Ride,
  type PaymentMethod,
  type User,
  type WalletTransaction,
  type DurationBucket,
  type Uuid,
} from '@/types/domain';

/**
 * Typed endpoints — one function per route.
 *
 * Each function:
 *   1. Calls `api.get/post/...` with the right schema.
 *   2. Returns the parsed, validated, typed payload.
 *   3. Throws `ApiClientError` on any failure (handled centrally in TanStack Query).
 *
 * Callers (hooks, components) NEVER call `api.*` directly — they go through this module.
 * That gives us one place to add caching, transforms, or feature flags later.
 */

// -----------------------------------------------------------------------------
// Auth
// -----------------------------------------------------------------------------

export const auth = {
  /** Returns the current user, or throws 401 if no session. */
  me: () => api.get<User>('/me', { schema: UserSchema }),

  /** Local fallback login by matricule (dev / SSO-down scenarios). */
  loginWithMatricule: (matricule: string) =>
    api.post<User>('/auth/matricule', { matricule }, { schema: UserSchema }),

  logout: () => api.post<void>('/auth/logout'),
};

// -----------------------------------------------------------------------------
// Stations & Scooters
// -----------------------------------------------------------------------------

export const fleet = {
  listStations: () =>
    api.get<Station[]>('/stations', { schema: z.array(StationSchema) }),

  listScooters: (params?: { status?: 'available' | 'occupied' | 'charging' }) => {
    const qs = params?.status ? `?status=${params.status}` : '';
    return api.get<Scooter[]>(`/scooters${qs}`, { schema: z.array(ScooterSchema) });
  },

  getScooter: (id: Uuid) =>
    api.get<Scooter>(`/scooters/${id}`, { schema: ScooterSchema }),

  /**
   * Validate a scanned QR payload and return the scooter context.
   * The server checks the signature; the frontend never trusts a raw scan.
   */
  scanScooter: (scooterCode: string, signature: string) =>
    api.post<Scooter>(
      `/scooters/${scooterCode}/scan`,
      { signature },
      { schema: ScooterSchema },
    ),
};

// -----------------------------------------------------------------------------
// Rides
// -----------------------------------------------------------------------------

export interface CreateRideInput {
  scooterId: Uuid;
  durationHours: DurationBucket;
  paymentMethodId: Uuid;
}

export const rides = {
  list: () => api.get<Ride[]>('/rides', { schema: z.array(RideSchema) }),

  get: (id: Uuid) => api.get<Ride>(`/rides/${id}`, { schema: RideSchema }),

  /**
   * Create a reservation. This authorizes payment and locks the scooter row,
   * but does NOT yet send the unlock command — call `unlock()` next.
   *
   * `idempotencyKey` is provided by the caller to ensure that a network retry
   * of the *same* user action doesn't create a duplicate reservation.
   */
  create: (input: CreateRideInput, idempotencyKey: string) =>
    api.post<Ride>('/rides', input, { schema: RideSchema, idempotencyKey }),

  /** Send the unlock command. Idempotent — safe to retry on the same key. */
  unlock: (rideId: Uuid, idempotencyKey: string) =>
    api.post<Ride>(
      `/rides/${rideId}/unlock`,
      undefined,
      { schema: RideSchema, idempotencyKey },
    ),

  end: (rideId: Uuid) =>
    api.post<Ride>(`/rides/${rideId}/end`, undefined, { schema: RideSchema }),
};

// -----------------------------------------------------------------------------
// Payment & Wallet
// -----------------------------------------------------------------------------

export const payments = {
  listMethods: () =>
    api.get<PaymentMethod[]>('/payment-methods', { schema: z.array(PaymentMethodSchema) }),

  getWallet: () =>
    api.get<{ balanceCentimes: number; transactions: WalletTransaction[] }>(
      '/wallet',
      {
        schema: z.object({
          balanceCentimes: z.number().int(),
          transactions: z.array(WalletTransactionSchema),
        }),
      },
    ),
};
