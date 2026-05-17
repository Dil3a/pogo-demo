'use client';

/**
 * Ride dashboard — `/ride/[id]`.
 *
 * Three visual states, driven by ride.status:
 *   - reserved / unlocking → UnlockProgress + auto-fire unlock command
 *   - active               → Big "Terminer le trajet" CTA + ride summary
 *   - completed / cancelled → Receipt view
 *
 * The unlock command is issued once on mount when status is `reserved`. The
 * idempotency key is reused if the user refreshes mid-flow so the backend
 * doesn't see a duplicate send.
 */

import { useEffect, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Clock, MapPin, Receipt, Power } from 'lucide-react';
import { toast } from 'sonner';
import { Card, Skeleton } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { UnlockProgress } from '@/components/features/ride/UnlockProgress';
import { useRide, useUnlockRide, useEndRide } from '@/hooks/useRides';
import { formatMoney, formatTime } from '@/lib/format/money';

export default function RidePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const rideId = params.id;

  const { data: ride, isLoading } = useRide(rideId);
  const unlock = useUnlockRide();
  const endRide = useEndRide();

  // Fire the unlock command once when we land here with a freshly-created ride.
  // useRef prevents double-firing under React Strict Mode's intentional remount.
  const unlockTriggered = useRef(false);
  useEffect(() => {
    if (!ride) return;
    if (ride.status === 'reserved' && !unlockTriggered.current) {
      unlockTriggered.current = true;
      // The idempotency key MUST be stable across retries; we derive it from
      // the ride id so a refresh-and-retry doesn't generate a fresh one.
      unlock.mutate({
        rideId: ride.id,
        idempotencyKey: `unlock-${ride.id}`,
      });
    }
  }, [ride, unlock]);

  // Compute remaining time for the active state.
  const remainingMs = useMemo(() => {
    if (!ride?.expiresAt) return 0;
    return Math.max(0, new Date(ride.expiresAt).getTime() - Date.now());
  }, [ride?.expiresAt]);

  if (isLoading || !ride) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  const isFailed = ride.status === 'cancelled';
  const isActive = ride.status === 'active';
  const isUnlocking =
    ride.status === 'reserved' || ride.status === 'unlocking';
  const isDone = ride.status === 'completed' || isFailed;

  return (
    <div className="flex flex-col gap-5">
      {/* Header card */}
      <Card className="!bg-gradient-to-br !from-pogo-50 !to-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-semibold text-pogo-700">
              {ride.reference}
            </div>
            <div className="mt-1 text-2xl font-black text-uemf-blue">
              Trottinette {ride.scooterCode}
            </div>
            <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="h-3 w-3" />
              {ride.startStationLabel}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500">Durée</div>
            <div className="text-lg font-bold text-slate-800">
              {ride.durationHours}h
            </div>
            <div className="text-xs font-bold text-pogo-700">
              {formatMoney(ride.amountCentimes)}
            </div>
          </div>
        </div>
      </Card>

      {/* Unlock progress (reservation in flight) */}
      {(isUnlocking || isFailed) && (
        <Card>
          <h2 className="mb-3 text-sm font-bold text-uemf-blue">
            Déverrouillage en cours
          </h2>
          <UnlockProgress
            status={ride.status}
            failureReason={
              isFailed ? 'La trottinette n\u2019a pas répondu à temps.' : undefined
            }
          />
          {isFailed && (
            <div className="mt-4 flex gap-2">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => router.push('/map')}
              >
                Retour à la carte
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Active ride */}
      {isActive && (
        <Card>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-uemf-blue">
            <Clock className="h-4 w-4" />
            Trajet en cours
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="text-[11px] text-slate-500">Départ</div>
              <div className="text-sm font-bold text-slate-800">
                {ride.startedAt ? formatTime(ride.startedAt) : '—'}
              </div>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="text-[11px] text-slate-500">Expire à</div>
              <div className="text-sm font-bold text-slate-800">
                {formatTime(ride.expiresAt)}
              </div>
            </div>
          </div>
          <Button
            variant="danger"
            fullWidth
            size="lg"
            className="mt-4"
            loading={endRide.isPending}
            onClick={async () => {
              try {
                await endRide.mutateAsync(ride.id);
                toast.success('Trajet terminé. Merci d\u2019avoir utilisé POGO !');
              } catch (e) {
                toast.error(
                  e instanceof Error
                    ? e.message
                    : 'Impossible de terminer le trajet.',
                );
              }
            }}
          >
            <Power className="h-5 w-5" />
            Terminer le trajet
          </Button>
        </Card>
      )}

      {/* Completed receipt */}
      {ride.status === 'completed' && (
        <Card>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-uemf-blue">
            <Receipt className="h-4 w-4" />
            Reçu
          </h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Trottinette</dt>
              <dd className="font-bold text-slate-800">{ride.scooterCode}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Départ</dt>
              <dd className="font-bold text-slate-800">
                {ride.startStationLabel}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Arrivée</dt>
              <dd className="font-bold text-slate-800">
                {ride.endStationLabel ?? '—'}
              </dd>
            </div>
            <div className="flex justify-between border-t pt-2 text-base">
              <dt className="font-semibold">Total réglé</dt>
              <dd className="font-black text-pogo-700">
                {formatMoney(ride.amountCentimes)}
              </dd>
            </div>
          </dl>
          <Button
            variant="secondary"
            fullWidth
            className="mt-4"
            onClick={() => router.push('/map')}
          >
            Retour à la carte
          </Button>
        </Card>
      )}
    </div>
  );
}
