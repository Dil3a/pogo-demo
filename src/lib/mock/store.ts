/**
 * Mock store — uses a module-level singleton on the server.
 *
 * IMPORTANT: On serverless platforms (Netlify, Vercel), each function
 * invocation may get a fresh module instance. To work around this, we
 * serialize critical state (rides, wallet) into a global variable that
 * persists across warm invocations, and fall back to seed data on cold starts.
 */

import {
  type Station,
  type Scooter,
  type User,
  type Ride,
  type PaymentMethod,
  type WalletTransaction,
} from '@/types/domain';

export const RATE_CARD = [
  { hours: 1, priceCentimes: 500 },
  { hours: 2, priceCentimes: 1000 },
  { hours: 4, priceCentimes: 2000 },
] as const;

export function getRateForHours(hours: number): number {
  return RATE_CARD.find((r) => r.hours === hours)?.priceCentimes ?? 0;
}

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
  { id: 'aaaaaaaa-0000-0000-0000-000000000001', code: 'T-01', status: 'available', batteryPct: 92, stationId: seedStations[0]!.id, stationLabel: seedStations[0]!.label, lat: seedStations[0]!.lat, lng: seedStations[0]!.lng, lastSeenAt: new Date().toISOString() },
  { id: 'aaaaaaaa-0000-0000-0000-000000000002', code: 'T-02', status: 'available', batteryPct: 78, stationId: seedStations[1]!.id, stationLabel: seedStations[1]!.label, lat: seedStations[1]!.lat, lng: seedStations[1]!.lng, lastSeenAt: new Date().toISOString() },
  { id: 'aaaaaaaa-0000-0000-0000-000000000003', code: 'T-03', status: 'available', batteryPct: 85, stationId: seedStations[2]!.id, stationLabel: seedStations[2]!.label, lat: seedStations[2]!.lat, lng: seedStations[2]!.lng, lastSeenAt: new Date().toISOString() },
  { id: 'aaaaaaaa-0000-0000-0000-000000000004', code: 'T-04', status: 'available', batteryPct: 61, stationId: seedStations[2]!.id, stationLabel: seedStations[2]!.label, lat: seedStations[2]!.lat, lng: seedStations[2]!.lng, lastSeenAt: new Date().toISOString() },
  { id: 'aaaaaaaa-0000-0000-0000-000000000005', code: 'T-05', status: 'occupied', batteryPct: 43, stationId: null, stationLabel: null, lat: CAMPUS_CENTER.lat + 0.0005, lng: CAMPUS_CENTER.lng - 0.0005, lastSeenAt: new Date().toISOString() },
  { id: 'aaaaaaaa-0000-0000-0000-000000000006', code: 'T-06', status: 'occupied', batteryPct: 30, stationId: null, stationLabel: null, lat: CAMPUS_CENTER.lat - 0.0007, lng: CAMPUS_CENTER.lng + 0.0009, lastSeenAt: new Date().toISOString() },
  { id: 'aaaaaaaa-0000-0000-0000-000000000007', code: 'T-07', status: 'occupied', batteryPct: 15, stationId: null, stationLabel: null, lat: CAMPUS_CENTER.lat - 0.0011, lng: CAMPUS_CENTER.lng - 0.0003, lastSeenAt: new Date().toISOString() },
  { id: 'aaaaaaaa-0000-0000-0000-000000000008', code: 'T-08', status: 'charging', batteryPct: 22, stationId: seedStations[5]!.id, stationLabel: seedStations[5]!.label, lat: seedStations[5]!.lat, lng: seedStations[5]!.lng, lastSeenAt: new Date().toISOString() },
];

const seedUser: User = {
  id: 'bbbbbbbb-0000-0000-0000-000000000001',
  matricule: '1234567',
  firstName: 'Yassine',
  lastName: 'El Idrissi',
  email: 'y.elidrissi@uemf.ma',
  establishment: 'UEMF',
  program: 'Génie Informatique',
  role: 'student',
  walletBalanceCentimes: 24700,
  createdAt: '2024-09-01T08:00:00.000Z',
};

const seedPaymentMethods: PaymentMethod[] = [
  { id: 'cccccccc-0000-0000-0000-000000000001', type: 'student_card', displayLabel: 'Carte étudiant 1234567', isDefault: true },
  { id: 'cccccccc-0000-0000-0000-000000000002', type: 'card', displayLabel: 'Visa •••• 4242', isDefault: false },
];

const seedTransactions: WalletTransaction[] = [
  { id: 'dddddddd-0000-0000-0000-000000000001', amountCentimes: 50000, reason: 'Recharge carte étudiant', createdAt: '2026-05-10T09:00:00.000Z', relatedRideReference: null },
];

/**
 * Use a global variable to persist state across serverless warm invocations.
 * This is the standard pattern for in-memory state on serverless platforms.
 */
declare global {
  // eslint-disable-next-line no-var
  var __pogo_store: MockStore | undefined;
}

class MockStore {
  stations: Station[] = structuredClone(seedStations);
  scooters: Scooter[] = structuredClone(seedScooters);
  user: User = structuredClone(seedUser);
  rides: Ride[] = [];
  paymentMethods: PaymentMethod[] = structuredClone(seedPaymentMethods);
  transactions: WalletTransaction[] = structuredClone(seedTransactions);
  idempotency: Map<string, { response: unknown; at: number }> = new Map();

  reset() {
    this.stations = structuredClone(seedStations);
    this.scooters = structuredClone(seedScooters);
    this.user = structuredClone(seedUser);
    this.rides = [];
    this.paymentMethods = structuredClone(seedPaymentMethods);
    this.transactions = structuredClone(seedTransactions);
    this.idempotency = new Map();
  }
}

// Reuse across warm serverless invocations
if (!global.__pogo_store) {
  global.__pogo_store = new MockStore();
}

export const store = global.__pogo_store;
