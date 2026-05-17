'use client';

/**
 * Wallet page — shows the student-card balance and the last 20 transactions.
 *
 * Visual hierarchy mirrors the portal: a big balance card at the top, then a
 * chronologically-sorted transaction ledger. Refunds (credit) and ride debits
 * are colour-coded.
 *
 * We do NOT offer a "top-up" CTA from this screen in MVP — in production,
 * student card top-up is handled by the existing UEMF student-services system.
 */

import { Wallet, ArrowDownLeft, ArrowUpRight, Info } from 'lucide-react';
import { Card, Skeleton } from '@/components/ui';
import { useWallet } from '@/hooks/usePayment';
import { formatMoney, formatMoneySigned, formatDateTime } from '@/lib/format/money';

export default function WalletPage() {
  const { data, isLoading } = useWallet();

  return (
    <div className="flex flex-col gap-5">
      {/* Balance card */}
      <Card
        className="!border-pogo-300 !bg-gradient-to-br !from-pogo-50 !to-white"
      >
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-pogo-700">
          <Wallet className="h-4 w-4" /> Solde carte étudiant
        </div>
        <div className="mt-2 text-4xl font-black text-uemf-blue">
          {isLoading ? '…' : formatMoney(data?.balanceCentimes ?? 0)}
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Le solde est rechargé via le service des affaires académiques.
        </p>
      </Card>

      {/* Transactions */}
      <section>
        <h2 className="mb-3 text-sm font-bold text-uemf-blue">
          Dernières opérations
        </h2>

        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : !data?.transactions.length ? (
          <Card className="flex items-center gap-3 bg-slate-50 text-sm text-slate-500">
            <Info className="h-4 w-4" />
            Aucune opération pour le moment.
          </Card>
        ) : (
          <ul className="flex flex-col gap-2">
            {data.transactions.map((tx) => {
              const isCredit = tx.amountCentimes > 0;
              return (
                <li
                  key={tx.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                        isCredit
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {isCredit ? (
                        <ArrowDownLeft className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </span>
                    <div>
                      <div className="text-sm font-bold text-slate-800">
                        {tx.reason}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {formatDateTime(tx.createdAt)}
                        {tx.relatedRideReference &&
                          ` · ${tx.relatedRideReference}`}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-black ${
                      isCredit ? 'text-green-700' : 'text-red-700'
                    }`}
                  >
                    {formatMoneySigned(tx.amountCentimes)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
