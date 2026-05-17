import type {
  Scooter,
  Station,
  Ride,
  User,
  PaymentMethod,
  WalletTransaction,
} from '@/types/domain';

/**
 * In-memory mock data store.
 *
 * This is the "backend" when `NEXT_PUBLIC_USE_MOCK_API=true`. The seed data
 * mirrors the existing UEMF portal exactly — same scooter codes (T-01..T-08),
 * same station labels (Entrée principale, Station A1, Bibliothèque, Cantine),
 * same pricing (1h=5 DHS, 2h=10 DHS, 4h=20 DHS).
 *
 * Why a module-level singleton:
 *   - Next.js dev server preserves module state across hot reloads inside a
 *     single process, so the data persists during a dev session.
 *   - On serverless this resets each cold start — that's a feature, not a bug,
 *     because mock data shouldn't accumulate cruft.
 *
 * NOT for production. In production, swap `useMockApi` off and point at NestJS.
 */

// -----------------------------------------------------------------------------
// Pricing rate card — single source of truth
// -----------------------------------------------------------------------------

export const RATE_CARD = [
  { hours: 1, priceCentimes: 500 },   // 1h = 5 DHS
  { hours: 2, priceCentimes: 1000 },  // 2h = 10 DHS
  { hours: 4, priceCentimes: 2000 },  // 4h = 20 DHS
] as const;

export function getRateForHours(hours: number): number {
  return RATE_CARD.find((r) => r.hours === hours)?.priceCentimes ?? 0;
}

// -----------------------------------------------------------------------------
// Seed data
// -----------------------------------------------------------------------------

// Approximate UEMF campus coordinates (Fes, Morocco).
const CAMPUS_CENTER = { lat: 34.0449, lng: -5.0647 };

function offset(deltaLat: number, deltaLng: number) {
  return { lat: CAMPUS_CENTER.lat + deltaLat, lng: CAMPUS_CENTER.lng + deltaLng };
}

const seedStations: Station[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    code: 'ENTREE_PRINCIPALE',
    label: 'Entrée principale',
    ...offset(0, 0),
    capacity: 8,
    availableCount: 1,
    isActive: true,
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    code: 'A1',
    label: 'Station A1',
    ...offset(0.0015, 0.001),
    capacity: 6,
    availableCount: 1,
    isActive: true,
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    code: 'B1',
    label: 'Station B1',
    ...offset(-0.001, 0.0018),
    capacity: 6,
    availableCount: 2,
    isActive: true,
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    code: 'BIB_CENTRALE',
    label: 'Bibliothèque centrale',
    ...offset(0.0008, -0.0012),
    capacity: 4,
    availableCount: 0,
    isActive: true,
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    code: 'CANTINE',
    label: 'Cantine',
    ...offset(-0.0014, -0.0008),
    capacity: 4,
    availableCount: 0,
    isActive: true,
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    code: 'C',
    label: 'Station C',
    ...offset(0.0022, 0.0022),
    capacity: 6,
    availableCount: 0,
    isActive: true,
  },
];

const seedScooters: Scooter[] = [
  {
    id: 'aaaaaaaa-0000-0000-0000-000000000001',
    code: 'T-01',
    status: 'available',
    batteryPct: 92,
    stationId: seedStations[0]!.id,
    stationLabel: seedStations[0]!.label,
    lat: seedStations[0]!.lat,
    lng: seedStations[0]!.lng,
    lastSeenAt: new Date().toISOString(),
  },
  {
    id: 'aaaaaaaa-0000-0000-0000-000000000002',
    code: 'T-02',
    status: 'available',
    batteryPct: 78,
    stationId: seedStations[1]!.id,
    stationLabel: seedStations[1]!.label,
    lat: seedStations[1]!.lat,
    lng: seedStations[1]!.lng,
    lastSeenAt: new Date().toISOString(),
  },
  {
    id: 'aaaaaaaa-0000-0000-0000-000000000003',
    code: 'T-03',
    status: 'available',
    batteryPct: 85,
    stationId: seedStations[2]!.id,
    stationLabel: seedStations[2]!.label,
    lat: seedStations[2]!.lat,
    lng: seedStations[2]!.lng,
    lastSeenAt: new Date().toISOString(),
  },
  {
    id: 'aaaaaaaa-0000-0000-0000-000000000004',
    code: 'T-04',
    status: 'available',
    batteryPct: 61,
    stationId: seedStations[2]!.id,
    stationLabel: seedStations[2]!.label,
    lat: seedStations[2]!.lat,
    lng: seedStations[2]!.lng,
    lastSeenAt: new Date().toISOString(),
  },
  {
    id: 'aaaaaaaa-0000-0000-0000-000000000005',
    code: 'T-05',
    status: 'occupied',
    batteryPct: 43,
    stationId: null,
    stationLabel: null,
    lat: CAMPUS_CENTER.lat + 0.0005,
    lng: CAMPUS_CENTER.lng - 0.0005,
    lastSeenAt: new Date().toISOString(),
  },
  {
    id: 'aaaaaaaa-0000-0000-0000-000000000006',
    code: 'T-06',
    status: 'occupied',
    batteryPct: 30,
    stationId: null,
    stationLabel: null,
    lat: CAMPUS_CENTER.lat - 0.0007,
    lng: CAMPUS_CENTER.lng + 0.0009,
    lastSeenAt: new Date().toISOString(),
  },
  {
    id: 'aaaaaaaa-0000-0000-0000-000000000007',
    code: 'T-07',
    status: 'occupied',
    batteryPct: 15,
    stationId: null,
    stationLabel: null,
    lat: CAMPUS_CENTER.lat - 0.0011,
    lng: CAMPUS_CENTER.lng - 0.0003,
    lastSeenAt: new Date().toISOString(),
  },
  {
    id: 'aaaaaaaa-0000-0000-0000-000000000008',
    code: 'T-08',
    status: 'charging',
    batteryPct: 22,
    stationId: seedStations[5]!.id,
    stationLabel: seedStations[5]!.label,
    lat: seedStations[5]!.lat,
    lng: seedStations[5]!.lng,
    lastSeenAt: new Date().toISOString(),
  },
];

const seedUser: User = {
  id: 'bbbbbbbb-0000-0000-0000-000000000001',
  matricule: '1234567',
  email: 'student@uemf.ma',
  firstName: 'Yassine',
  lastName: 'El Idrissi',
  establishment: 'UEMF',
  program: 'Génie Informatique',
  role: 'student',
  walletBalanceCentimes: 24700, // 247 DHS — matches the existing portal display
  createdAt: '2024-09-01T08:00:00.000Z',
};

const seedPaymentMethods: PaymentMethod[] = [
  {
    id: 'cccccccc-0000-0000-0000-000000000001',
    type: 'student_card',
    displayLabel: 'Carte étudiant 1234567',
    isDefault: true,
  },
  {
    id: 'cccccccc-0000-0000-0000-000000000002',
    type: 'card',
    displayLabel: 'Visa •••• 4242',
    isDefault: false,
  },
];

const seedTransactions: WalletTransaction[] = [
  {
    id: 'dddddddd-0000-0000-0000-000000000001',
    amountCentimes: 50000,
    reason: 'Recharge carte étudiant',
    createdAt: '2026-05-10T09:00:00.000Z',
    relatedRideReference: null,
  },
  {
    id: 'dddddddd-0000-0000-0000-000000000002',
    amountCentimes: -500,
    reason: 'Réservation trottinette T-02 (1h)',
    createdAt: '2026-05-12T14:23:00.000Z',
    relatedRideReference: 'TRT-1736000000',
  },
  {
    id: 'dddddddd-0000-0000-0000-000000000003',
    amountCentimes: -1000,
    reason: 'Réservation trottinette T-03 (2h)',
    createdAt: '2026-05-14T11:05:00.000Z',
    relatedRideReference: 'TRT-1736100000',
  },
];

const seedRides: Ride[] = [
  {
    id: 'eeeeeeee-0000-0000-0000-000000000001',
    reference: 'TRT-1736000000',
    userId: seedUser.id,
    scooterId: seedScooters[1]!.id,
    scooterCode: 'T-02',
    startStationLabel: 'Station A1',
    endStationLabel: 'Bibliothèque centrale',
    status: 'completed',
    durationHours: 1,
    amountCentimes: 500,
    reservedAt: '2026-05-12T14:20:00.000Z',
    startedAt: '2026-05-12T14:23:00.000Z',
    endedAt: '2026-05-12T15:18:00.000Z',
    expiresAt: '2026-05-12T15:23:00.000Z',
  },
  {
    id: 'eeeeeeee-0000-0000-0000-000000000002',
    reference: 'TRT-1736100000',
    userId: seedUser.id,
    scooterId: seedScooters[2]!.id,
    scooterCode: 'T-03',
    startStationLabel: 'Station B1',
    endStationLabel: 'Cantine',
    status: 'completed',
    durationHours: 2,
    amountCentimes: 1000,
    reservedAt: '2026-05-14T11:00:00.000Z',
    startedAt: '2026-05-14T11:05:00.000Z',
    endedAt: '2026-05-14T12:48:00.000Z',
    expiresAt: '2026-05-14T13:05:00.000Z',
  },
];

// -----------------------------------------------------------------------------
// Mutable in-memory state — deep copies so seeds aren't mutated
// -----------------------------------------------------------------------------

class MockStore {
  user: User = structuredClone(seedUser);
  stations: Station[] = structuredClone(seedStations);
  scooters: Scooter[] = structuredClone(seedScooters);
  rides: Ride[] = structuredClone(seedRides);
  paymentMethods: PaymentMethod[] = structuredClone(seedPaymentMethods);
  transactions: WalletTransaction[] = structuredClone(seedTransactions);

  /**
   * Idempotency cache for unsafe POSTs.
   * key → { responseJson, timestamp }
   */
  idempotency = new Map<string, { response: unknown; at: number }>();

  reset() {
    this.user = structuredClone(seedUser);
    this.stations = structuredClone(seedStations);
    this.scooters = structuredClone(seedScooters);
    this.rides = structuredClone(seedRides);
    this.paymentMethods = structuredClone(seedPaymentMethods);
    this.transactions = structuredClone(seedTransactions);
    this.idempotency.clear();
  }
}

declare global {
  // Persist across HMR reloads in development.
   
  var __pogoMockStore: MockStore | undefined;
}

export const store: MockStore = globalThis.__pogoMockStore ?? new MockStore();
if (process.env.NODE_ENV !== 'production') {
  globalThis.__pogoMockStore = store;
}
