'use client';

/**
 * Admin rides view — chronological table of all rides on the platform.
 *
 * In production this hits an admin-only endpoint that returns rides across all
 * users (paginated). For the mock we reuse the per-user endpoint.
 */

import Link from 'next/link';
import { ScrollText } from 'lucide-react';
import { Card, Skeleton } from '@/components/ui';
import { useRideHistory } from '@/hooks/useRides';
import { formatMoney, formatDateTime } from '@/lib/format/money';
import type { Ride } from '@/types/domain';

const STATUS_COLORS: Record<Ride['status'], string> = {
  reserved: 'bg-blue-50 text-blue-700',
  unlocking: 'bg-blue-50 text-blue-700',
  active: 'bg-pogo-50 text-pogo-700',
  completed: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700',
};

const STATUS_LABELS: Record<Ride['status'], string> = {
  reserved: 'Réservé',
  unlocking: 'Déverrouillage',
  active: 'En cours',
  completed: 'Terminé',
  cancelled: 'Annulé',
};

export default function AdminRidesPage() {
  const { data: rides, isLoading } = useRideHistory();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-uemf-blue">
          <ScrollText className="h-6 w-6" /> Trajets
        </h1>
        <p className="text-sm text-slate-500">
          Historique complet des trajets POGO.
        </p>
      </div>

      <Card className="!p-0 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">Référence</th>
              <th className="px-4 py-3">Trottinette</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Durée</th>
              <th className="px-4 py-3">Montant</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={6} className="px-4 py-3">
                    <Skeleton className="h-5 w-full" />
                  </td>
                </tr>
              ))
            ) : !rides || rides.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  Aucun trajet enregistré.
                </td>
              </tr>
            ) : (
              rides.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/ride/${r.id}`}
                      className="font-mono text-xs font-semibold text-uemf-blue hover:underline"
                    >
                      {r.reference}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-800">
                    {r.scooterCode}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_COLORS[r.status]}`}
                    >
                      {STATUS_LABELS[r.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{r.durationHours}h</td>
                  <td className="px-4 py-3 font-bold text-pogo-700">
                    {formatMoney(r.amountCentimes)}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {formatDateTime(r.reservedAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
