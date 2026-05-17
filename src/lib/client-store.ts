/**
 * CLIENT-SIDE MOCK STORE
 * 
 * All data lives in browser memory — no API calls, no serverless issues.
 * This is a singleton that persists for the entire browser session.
 */

import type { Scooter, Station, Ride, User, PaymentMethod, WalletTransaction } from '@/types/domain';

const CAMPUS = { lat: 34.0449, lng: -5.0647 };
const off = (dLat: number, dLng: number) => ({ lat: CAMPUS.lat + dLat, lng: CAMPUS.lng + dLng });

export const RATE_CARD = [
  { hours: 1 as const, priceCentimes: 500 },
  { hours: 2 as const, priceCentimes: 1000 },
  { hours: 4 as const, priceCentimes: 2000 },
];

const initialStations: Station[] = [
  { id: 's1', code: 'ENTREE', label: 'Entrée principale', ...off(0, 0), capacity: 8, availableCount: 4, isActive: true },
  { id: 's2', code: 'A1', label: 'Station A1', ...off(0.0015, 0.001), capacity: 6, availableCount: 2, isActive: true },
  { id: 's3', code: 'B1', label: 'Station B1', ...off(-0.001, 0.0018), capacity: 6, availableCount: 2, isActive: true },
  { id: 's4', code: 'BIB', label: 'Bibliothèque centrale', ...off(0.0008, -0.0012), capacity: 4, availableCount: 0, isActive: true },
  { id: 's5', code: 'CANTINE', label: 'Cantine', ...off(-0.0014, -0.0008), capacity: 4, availableCount: 0, isActive: true },
  { id: 's6', code: 'C', label: 'Station C', ...off(0.0022, 0.0022), capacity: 6, availableCount: 0, isActive: true },
];

const initialScooters: Scooter[] = [
  { id: 't1', code: 'T-01', status: 'available', batteryPct: 92, stationId: 's1', stationLabel: 'Entrée principale', lat: off(0.0001, 0.0001).lat, lng: off(0.0001, 0.0001).lng, lastSeenAt: new Date().toISOString() },
  { id: 't2', code: 'T-02', status: 'available', batteryPct: 78, stationId: 's1', stationLabel: 'Entrée principale', lat: off(-0.0001, 0.0001).lat, lng: off(-0.0001, 0.0001).lng, lastSeenAt: new Date().toISOString() },
  { id: 't3', code: 'T-03', status: 'available', batteryPct: 85, stationId: 's2', stationLabel: 'Station A1', lat: off(0.0015, 0.0011).lat, lng: off(0.0015, 0.0011).lng, lastSeenAt: new Date().toISOString() },
  { id: 't4', code: 'T-04', status: 'available', batteryPct: 61, stationId: 's3', stationLabel: 'Station B1', lat: off(-0.001, 0.0019).lat, lng: off(-0.001, 0.0019).lng, lastSeenAt: new Date().toISOString() },
  { id: 't5', code: 'T-05', status: 'occupied', batteryPct: 43, stationId: null, stationLabel: null, lat: off(0.0005, -0.0005).lat, lng: off(0.0005, -0.0005).lng, lastSeenAt: new Date().toISOString() },
  { id: 't6', code: 'T-06', status: 'occupied', batteryPct: 30, stationId: null, stationLabel: null, lat: off(-0.0007, 0.0009).lat, lng: off(-0.0007, 0.0009).lng, lastSeenAt: new Date().toISOString() },
  { id: 't7', code: 'T-07', status: 'charging', batteryPct: 15, stationId: 's4', stationLabel: 'Bibliothèque centrale', lat: off(0.0008, -0.0011).lat, lng: off(0.0008, -0.0011).lng, lastSeenAt: new Date().toISOString() },
  { id: 't8', code: 'T-08', status: 'charging', batteryPct: 22, stationId: 's6', stationLabel: 'Station C', lat: off(0.0022, 0.0023).lat, lng: off(0.0022, 0.0023).lng, lastSeenAt: new Date().toISOString() },
];

const initialUser: User = {
  id: 'u1',
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

const initialPaymentMethods: PaymentMethod[] = [
  { id: 'pm1', type: 'student_card', displayLabel: 'Carte étudiant 1234567', isDefault: true },
  { id: 'pm2', type: 'card', displayLabel: 'Visa •••• 4242', isDefault: false },
];

const initialTransactions: WalletTransaction[] = [
  { id: 'tx0', amountCentimes: 50000, reason: 'Recharge carte étudiant', createdAt: '2026-05-10T09:00:00.000Z', relatedRideReference: null },
];

class ClientStore {
  stations: Station[] = structuredClone(initialStations);
  scooters: Scooter[] = structuredClone(initialScooters);
  user: User = structuredClone(initialUser);
  rides: Ride[] = [];
  paymentMethods: PaymentMethod[] = structuredClone(initialPaymentMethods);
  transactions: WalletTransaction[] = structuredClone(initialTransactions);
  listeners: Set<() => void> = new Set();

  subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notify() {
    this.listeners.forEach((fn) => fn());
  }

  // AUTH
  login(matricule: string): User {
    this.user = { ...this.user, matricule };
    this.notify();
    return this.user;
  }

  // SCOOTERS
  getScooters(status?: string): Scooter[] {
    return status ? this.scooters.filter((s) => s.status === status) : this.scooters;
  }

  getStations(): Station[] {
    return this.stations.map((s) => ({
      ...s,
      availableCount: this.scooters.filter((sc) => sc.stationId === s.id && sc.status === 'available').length,
    }));
  }

  // RIDES
  createRide(scooterId: string, durationHours: 1 | 2 | 4, paymentMethodId: string): Ride {
    const scooter = this.scooters.find((s) => s.id === scooterId);
    if (!scooter) throw new Error('Trottinette introuvable');
    if (scooter.status !== 'available') throw new Error('Trottinette non disponible');

    const method = this.paymentMethods.find((m) => m.id === paymentMethodId);
    if (!method) throw new Error('Mode de paiement introuvable');

    const rate = RATE_CARD.find((r) => r.hours === durationHours);
    const amountCentimes = rate?.priceCentimes ?? 500;

    if (method.type === 'student_card') {
      if (this.user.walletBalanceCentimes < amountCentimes) {
        throw new Error('Solde insuffisant sur la carte étudiant');
      }
      this.user.walletBalanceCentimes -= amountCentimes;
      this.transactions.unshift({
        id: `tx-${Date.now()}`,
        amountCentimes: -amountCentimes,
        reason: `Réservation trottinette ${scooter.code} (${durationHours}h)`,
        createdAt: new Date().toISOString(),
        relatedRideReference: null,
      });
    }

    const now = new Date();
    const ride: Ride = {
      id: `ride-${Date.now()}`,
      reference: `TRT-${Date.now()}`,
      userId: this.user.id,
      scooterId: scooter.id,
      scooterCode: scooter.code,
      startStationLabel: scooter.stationLabel ?? 'Campus UEMF',
      endStationLabel: null,
      status: 'reserved',
      durationHours,
      amountCentimes,
      reservedAt: now.toISOString(),
      startedAt: null,
      endedAt: null,
      expiresAt: new Date(now.getTime() + durationHours * 3600000).toISOString(),
    };

    // Mark scooter as occupied
    scooter.status = 'occupied';
    scooter.stationId = null;
    scooter.stationLabel = null;

    this.rides.unshift(ride);
    this.notify();
    return ride;
  }

  unlockRide(rideId: string): Ride {
    const ride = this.rides.find((r) => r.id === rideId);
    if (!ride) throw new Error('Course introuvable');

    ride.status = 'active';
    ride.startedAt = new Date().toISOString();
    this.notify();
    return { ...ride };
  }

  endRide(rideId: string): Ride {
    const ride = this.rides.find((r) => r.id === rideId);
    if (!ride) throw new Error('Course introuvable');

    ride.status = 'completed';
    ride.endedAt = new Date().toISOString();

    // Return scooter to first available station
    const scooter = this.scooters.find((s) => s.id === ride.scooterId);
    const station = this.stations[0]!;
    if (scooter) {
      scooter.status = 'available';
      scooter.stationId = station.id;
      scooter.stationLabel = station.label;
      scooter.lat = station.lat;
      scooter.lng = station.lng;
      ride.endStationLabel = station.label;
    }

    this.notify();
    return { ...ride };
  }

  getWallet() {
    return {
      balanceCentimes: this.user.walletBalanceCentimes,
      transactions: this.transactions.slice(0, 20),
    };
  }

  reset() {
    this.stations = structuredClone(initialStations);
    this.scooters = structuredClone(initialScooters);
    this.user = structuredClone(initialUser);
    this.rides = [];
    this.paymentMethods = structuredClone(initialPaymentMethods);
    this.transactions = structuredClone(initialTransactions);
    this.notify();
  }
}

// Single instance for entire browser session
let instance: ClientStore | null = null;

export function getClientStore(): ClientStore {
  if (!instance) instance = new ClientStore();
  return instance;
}
