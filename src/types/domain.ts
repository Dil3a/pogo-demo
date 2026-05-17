import { z } from 'zod';

/**
 * Domain types and Zod schemas for the POGO platform.
 *
 * Why Zod here:
 *   - Single source of truth: derive TS types AND runtime validators from one declaration.
 *   - Validate at every trust boundary (API responses, form inputs, QR payloads).
 *   - When the real backend ships, these schemas guarantee the frontend breaks loudly
 *     if a contract changes, rather than failing silently with `undefined` somewhere deep.
 */

// -----------------------------------------------------------------------------
// Primitives
// -----------------------------------------------------------------------------

/** UUID v4 string. We use UUID for primary keys, never matricule. */
export const UuidSchema = z.string().uuid();
export type Uuid = z.infer<typeof UuidSchema>;

/** Money stored as integer minor units (centimes). 1 DHS = 100 centimes. */
export const MoneySchema = z.object({
  amountCentimes: z.number().int().nonnegative(),
  currency: z.literal('MAD'),
});
export type Money = z.infer<typeof MoneySchema>;

/** UEMF student matricule: exactly 7 digits, matches the existing portal regex. */
export const MatriculeRegex = /^\d{7}$/;
export const MatriculeSchema = z.string().regex(MatriculeRegex, 'Matricule must be exactly 7 digits');
export type Matricule = z.infer<typeof MatriculeSchema>;

// -----------------------------------------------------------------------------
// User
// -----------------------------------------------------------------------------

export const UserRoleSchema = z.enum(['student', 'admin', 'super_admin']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserSchema = z.object({
  id: UuidSchema,
  matricule: MatriculeSchema,
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  establishment: z.string(), // "EPI", "ESN", "Faculté de Médecine", etc.
  program: z.string().nullable(),
  role: UserRoleSchema,
  walletBalanceCentimes: z.number().int(),
  createdAt: z.string().datetime(),
});
export type User = z.infer<typeof UserSchema>;

// -----------------------------------------------------------------------------
// Station — fixed campus locations where scooters dock
// -----------------------------------------------------------------------------

export const StationSchema = z.object({
  id: UuidSchema,
  code: z.string(), // "A1", "B1", "ENTREE_PRINCIPALE"
  label: z.string(), // "Station A1"
  lat: z.number(),
  lng: z.number(),
  capacity: z.number().int().positive(),
  availableCount: z.number().int().nonnegative(),
  isActive: z.boolean(),
});
export type Station = z.infer<typeof StationSchema>;

// -----------------------------------------------------------------------------
// Scooter
// -----------------------------------------------------------------------------

export const ScooterStatusSchema = z.enum([
  'available', // ready to be reserved
  'occupied',  // currently in an active ride
  'charging',  // docked, battery < 30%
  'maintenance', // taken out by ops
  'offline',   // no telemetry for >10 min
]);
export type ScooterStatus = z.infer<typeof ScooterStatusSchema>;

export const ScooterSchema = z.object({
  id: UuidSchema,
  code: z.string(), // "T-01" — what's printed on the deck
  status: ScooterStatusSchema,
  batteryPct: z.number().int().min(0).max(100),
  stationId: UuidSchema.nullable(), // null while in a ride
  stationLabel: z.string().nullable(), // denormalized for list views
  lat: z.number().nullable(),
  lng: z.number().nullable(),
  lastSeenAt: z.string().datetime().nullable(),
});
export type Scooter = z.infer<typeof ScooterSchema>;

// -----------------------------------------------------------------------------
// Ride
// -----------------------------------------------------------------------------

export const RideStatusSchema = z.enum([
  'reserved',  // payment authorized, unlock command sent
  'unlocking', // command in flight, awaiting ack
  'active',    // scooter unlocked, ride in progress
  'completed', // returned, settled
  'cancelled', // unlock failed / user aborted / refunded
]);
export type RideStatus = z.infer<typeof RideStatusSchema>;

/** Billed duration buckets in hours. Matches existing UEMF rate card. */
export const DurationBucketSchema = z.union([z.literal(1), z.literal(2), z.literal(4)]);
export type DurationBucket = z.infer<typeof DurationBucketSchema>;

export const RideSchema = z.object({
  id: UuidSchema,
  reference: z.string(), // "TRT-1736000000000" — human-facing
  userId: UuidSchema,
  scooterId: UuidSchema,
  scooterCode: z.string(),
  startStationLabel: z.string(),
  endStationLabel: z.string().nullable(),
  status: RideStatusSchema,
  durationHours: DurationBucketSchema,
  amountCentimes: z.number().int().nonnegative(),
  reservedAt: z.string().datetime(),
  startedAt: z.string().datetime().nullable(),
  endedAt: z.string().datetime().nullable(),
  expiresAt: z.string().datetime(), // when the reservation window ends
});
export type Ride = z.infer<typeof RideSchema>;

// -----------------------------------------------------------------------------
// Payment
// -----------------------------------------------------------------------------

export const PaymentMethodTypeSchema = z.enum(['card', 'student_card']);
export type PaymentMethodType = z.infer<typeof PaymentMethodTypeSchema>;

export const PaymentMethodSchema = z.object({
  id: UuidSchema,
  type: PaymentMethodTypeSchema,
  /** e.g. "Visa •••• 4242" or "Carte étudiant 1234567" */
  displayLabel: z.string(),
  isDefault: z.boolean(),
});
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

export const WalletTransactionSchema = z.object({
  id: UuidSchema,
  amountCentimes: z.number().int(), // signed: negative = debit
  reason: z.string(),
  createdAt: z.string().datetime(),
  relatedRideReference: z.string().nullable(),
});
export type WalletTransaction = z.infer<typeof WalletTransactionSchema>;

// -----------------------------------------------------------------------------
// API envelopes
// -----------------------------------------------------------------------------

export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.unknown()).optional(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;

export const ApiMetaSchema = z.object({
  requestId: z.string(),
  timestamp: z.string(),
  nextCursor: z.string().nullable().optional(),
});

/** Factory: typed envelope for any data schema. */
export function apiResponseSchema<T extends z.ZodTypeAny>(data: T) {
  return z.object({ data, meta: ApiMetaSchema });
}

// -----------------------------------------------------------------------------
// QR payload (signed URL)
// -----------------------------------------------------------------------------

export const QrPayloadSchema = z.object({
  scooterCode: z.string(),
  signature: z.string(),
  /** Key version — lets us rotate signing keys without invalidating all stickers */
  keyVersion: z.string().default('1'),
});
export type QrPayload = z.infer<typeof QrPayloadSchema>;
