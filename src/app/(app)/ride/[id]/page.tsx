'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Clock, MapPin, Receipt, Power, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { UnlockProgress } from '@/components/features/ride/UnlockProgress';
import { useRide, useUnlockRide, useEndRide } from '@/hooks/useRides';
import { useRideStore } from '@/stores/ride.store';
import { formatMoney, formatTime } from '@/lib/format/money';

function useCountdown(expiresAt: string | null | undefined) {
  const [remaining, setRemaining] = useState('');
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) { setRemaining('Expiré'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`);
      setIsWarning(diff < 10 * 60 * 1000); // warn under 10 minutes
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [expiresAt]);

  return { remaining, isWarning };
}

export default function RidePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const rideId = params.id;

  const cachedRide = useRideStore((s) => s.activeRide);
  const setActiveRide = useRideStore((s) => s.setActiveRide);

  const { data: storeRide } = useRide(rideId);
  const ride = storeRide ?? (cachedRide?.id === rideId ? cachedRide : null);

  const unlock = useUnlockRide();
  const endRide = useEndRide();
  const unlockTriggered = useRef(false);
  const { remaining, isWarning } = useCountdown(ride?.expiresAt);

  // Warn when ride is about to expire
  useEffect(() => {
    if (isWarning && ride?.status === 'active') {
      toast.warning('⏰ Votre trajet expire dans moins de 10 minutes !');
    }
  }, [isWarning, ride?.status]);

  useEffect(() => {
    if (!ride) return;
    if (ride.status === 'reserved' && !unlockTriggered.current) {
      unlockTriggered.current = true;
      unlock.mutate(
        { rideId: ride.id, idempotencyKey: `unlock-${ride.id}` },
        { onSuccess: (updatedRide) => setActiveRide(updatedRide) },
      );
    }
  }, [ride, unlock, setActiveRide]);

  if (!ride) return (
    <div className="flex flex-col items-center gap-4 p-8 text-center">
      <div className="text-4xl">⚠️</div>
      <p className="text-sm text-slate-500">Course introuvable.</p>
      <Button variant="secondary" onClick={() => router.push('/map')}>Retour à la carte</Button>
    </div>
  );

  const isFailed = ride.status === 'cancelled';
  const isActive = ride.status === 'active';
  const isUnlocking = ride.status === 'reserved' || ride.status === 'unlocking';

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <Card className="!bg-gradient-to-br !from-pogo-50 !to-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-semibold text-pogo-700">{ride.reference}</div>
            <div className="mt-1 text-2xl font-black text-uemf-blue">Trottinette {ride.scooterCode}</div>
            <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="h-3 w-3" />{ride.startStationLabel}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500">Durée</div>
            <div className="text-lg font-bold text-slate-800">{ride.durationHours}h</div>
            <div className="text-xs font-bold text-pogo-700">{formatMoney(ride.amountCentimes)}</div>
          </div>
        </div>
      </Card>

      {/* Unlocking */}
      {(isUnlocking || isFailed) && (
        <Card>
          <h2 className="mb-3 text-sm font-bold text-uemf-blue">
            {isFailed ? 'Déverrouillage échoué' : 'Déverrouillage en cours — génération de l\'attestation...'}
          </h2>
          <UnlockProgress status={ride.status} failureReason={isFailed ? "La trottinette n'a pas répondu." : undefined} />
          {isFailed && <Button variant="secondary" fullWidth className="mt-4" onClick={() => router.push('/map')}>Retour à la carte</Button>}
        </Card>
      )}

      {/* Active ride */}
      {isActive && (
        <Card>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-uemf-blue">
            <Clock className="h-4 w-4" /> Trajet en cours
          </h2>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="text-[11px] text-slate-500">Départ</div>
              <div className="text-sm font-bold">{ride.startedAt ? formatTime(ride.startedAt) : '—'}</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="text-[11px] text-slate-500">Expire à</div>
              <div className="text-sm font-bold">{formatTime(ride.expiresAt)}</div>
            </div>
          </div>
          {/* Countdown */}
          <div className={`rounded-xl p-3 text-center mb-3 ${isWarning ? 'bg-red-50 border border-red-200' : 'bg-pogo-50 border border-pogo-200'}`}>
            <div className="text-xs text-slate-500 mb-1">Temps restant</div>
            <div className={`font-black text-2xl ${isWarning ? 'text-red-600' : 'text-pogo-700'}`}>
              {remaining}
            </div>
            {isWarning && (
              <div className="flex items-center justify-center gap-1 mt-1 text-xs text-red-500 font-semibold">
                <AlertTriangle className="h-3 w-3" /> Terminez votre trajet bientôt
              </div>
            )}
          </div>
          <Button variant="danger" fullWidth size="lg" loading={endRide.isPending}
            onClick={async () => {
              try {
                const ended = await endRide.mutateAsync({ rideId: ride.id });
                setActiveRide(ended);
                toast.success("Trajet terminé. Merci d'avoir utilisé POGO !");
                const encoded = btoa(JSON.stringify(ended));
                router.push(`/attestation/${ended.id}?d=${encodeURIComponent(encoded)}`);
              } catch (e) {
                toast.error(e instanceof Error ? e.message : 'Impossible de terminer le trajet.');
              }
            }}
          >
            <Power className="h-5 w-5" /> Terminer le trajet
          </Button>
        </Card>
      )}

      {/* Receipt */}
      {ride.status === 'completed' && (
        <Card>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-uemf-blue">
            <Receipt className="h-4 w-4" /> Reçu
          </h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Trottinette</dt><dd className="font-bold">{ride.scooterCode}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Départ</dt><dd className="font-bold">{ride.startStationLabel}</dd></div>
            <div className="flex justify-between border-t pt-2 text-base">
              <dt className="font-semibold">Total réglé</dt>
              <dd className="font-black text-pogo-700">{formatMoney(ride.amountCentimes)}</dd>
            </div>
          </dl>
          <Button variant="secondary" fullWidth className="mt-4" onClick={() => router.push('/map')}>Retour à la carte</Button>
        </Card>
      )}
    </div>
  );
}
