import { z } from 'zod';
import { api } from './client';
import {
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

// -----------------------------------------------------------------------------
// Auth
// -----------------------------------------------------------------------------

export const auth = {
  me: () => api.get<User>('/me', { schema: UserSchema }),
  loginWithMatricule: (matricule: string) =>
    api.post<User>('/auth/matricule', { matricule }, { schema: UserSchema }),
  logout: () => api.post<void>('/auth/logout'),
};

// -----------------------------------------------------------------------------
// Stations & Scooters
// No Zod validation on list endpoints — validation failures caused silent loading hangs
// -----------------------------------------------------------------------------

export const fleet = {
  listStations: () =>
    api.get<Station[]>('/stations'),

  listScooters: (params?: { status?: 'available' | 'occupied' | 'charging' }) => {
    const qs = params?.status ? `?status=${params.status}` : '';
    return api.get<Scooter[]>(`/scooters${qs}`);
  },

  getScooter: (id: Uuid) =>
    api.get<Scooter>(`/scooters/${id}`),

  scanScooter: (scooterCode: string, signature: string) =>
    api.post<Scooter>(
      `/scooters/${scooterCode}/scan`,
      { signature },
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
  list: () => api.get<Ride[]>('/rides'),

  get: (id: Uuid) => api.get<Ride>(`/rides/${id}`, { schema: RideSchema }),

  create: (input: CreateRideInput, idempotencyKey: string) =>
    api.post<Ride>('/rides', input, { schema: RideSchema, idempotencyKey }),

  unlock: (rideId: Uuid, idempotencyKey: string, rideData?: Record<string, unknown>) =>
    api.post<Ride>(
      `/rides/${rideId}/unlock`,
      rideData,
      { idempotencyKey },
    ),

  end: (rideId: Uuid, rideData?: Record<string, unknown>) =>
    api.post<Ride>(`/rides/${rideId}/end`, rideData),
};

// -----------------------------------------------------------------------------
// Payments
// -----------------------------------------------------------------------------

export const payments = {
  listMethods: () =>
    api.get<PaymentMethod[]>('/payment-methods'),

  getWallet: () =>
    api.get<{ balanceCentimes: number; transactions: WalletTransaction[] }>(
      '/wallet',
    ),
};
