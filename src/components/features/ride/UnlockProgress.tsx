'use client';

/**
 * UnlockProgress — shows a 4-stage sequence while the unlock command travels
 * from browser → server → MQTT → scooter:
 *
 *   1. Authentification de la réservation
 *   2. Envoi de la commande au véhicule
 *   3. Confirmation matérielle
 *   4. Trottinette déverrouillée ✓
 *
 * On failure, the failed stage turns red and a refund notice appears, since the
 * server's compensating transaction will have credited the wallet back.
 *
 * The stages don't need to wait for real signals — we drive them off the ride
 * status (`reserved` → `unlocking` → `active` or `cancelled`). Polling at 3s
 * in `useRide` is what actually moves them forward.
 */

import { CheckCircle2, Loader2, XCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { RideStatus } from '@/types/domain';

interface Props {
  status: RideStatus;
  failureReason?: string;
}

type Stage = {
  id: number;
  label: string;
};

const STAGES: Stage[] = [
  { id: 1, label: 'Authentification de la réservation' },
  { id: 2, label: 'Envoi de la commande au véhicule' },
  { id: 3, label: 'Confirmation matérielle' },
  { id: 4, label: 'Trottinette déverrouillée' },
];

/** Maps the server-side ride status to the highest stage we should show as done. */
function activeStage(status: RideStatus): number {
  switch (status) {
    case 'reserved':
      return 1; // payment verified, command not yet sent
    case 'unlocking':
      return 2; // command on the wire
    case 'active':
      return 4; // fully complete
    case 'cancelled':
    case 'completed':
      return 4;
  }
}

export function UnlockProgress({ status, failureReason }: Props) {
  const failed = status === 'cancelled' && Boolean(failureReason);
  const currentStage = activeStage(status);

  return (
    <div className="flex flex-col gap-2">
      {STAGES.map((stage) => {
        const done = stage.id < currentStage;
        const isCurrent = stage.id === currentStage && !failed;
        const isFailedHere = failed && stage.id === currentStage;
        const pending = stage.id > currentStage && !failed;

        return (
          <div
            key={stage.id}
            className={cn(
              'flex items-center gap-3 rounded-lg border p-3 text-sm transition-colors',
              done && 'border-green-200 bg-green-50',
              isCurrent && 'border-pogo-300 bg-pogo-50',
              isFailedHere && 'border-red-300 bg-red-50',
              pending && 'border-slate-200 bg-slate-50 text-slate-400',
            )}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center">
              {done && (
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              )}
              {isCurrent && (
                <Loader2 className="h-5 w-5 animate-spin text-pogo-600" />
              )}
              {isFailedHere && <XCircle className="h-6 w-6 text-red-600" />}
              {pending && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 text-[10px] font-bold text-slate-400">
                  {stage.id}
                </span>
              )}
            </span>
            <span
              className={cn(
                'font-medium',
                done && 'text-green-800',
                isCurrent && 'text-pogo-800',
                isFailedHere && 'text-red-800',
              )}
            >
              {stage.label}
            </span>
          </div>
        );
      })}
      {failed && (
        <div className="mt-2 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <div className="font-bold">Déverrouillage échoué</div>
            <p className="mt-0.5 text-xs">
              {failureReason ?? 'Erreur inconnue.'} Aucun montant n'a été
              prélevé — votre carte étudiant a été recréditée automatiquement.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
