'use client';

/**
 * Profile page — read-only student information + logout.
 *
 * In MVP the profile is non-editable: student data is authoritative in UEMF's
 * directory (LDAP / IAM), and we don't want POGO to be a second source of
 * truth for name or programme. Top-up amounts flow in from the affaires
 * académiques system; we just display them.
 */

import { useRouter } from 'next/navigation';
import { User, LogOut, Mail, GraduationCap, Hash } from 'lucide-react';
import { Card, Skeleton } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { useMe, useLogout } from '@/hooks/useAuth';
import { formatMoney } from '@/lib/format/money';

export default function ProfilePage() {
  const router = useRouter();
  const { data: user, isLoading } = useMe();
  const logout = useLogout();

  async function handleLogout() {
    logout.mutate();
    router.push('/login');
  }

  if (isLoading || !user) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    );
  }

  const initials = `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();

  return (
    <div className="flex flex-col gap-5">
      {/* Identity */}
      <Card className="flex items-center gap-4 !bg-gradient-to-br !from-uemf-blue/5 !to-uemf-green/5">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-uemf-blue to-uemf-green text-xl font-black text-white">
          {initials}
        </div>
        <div>
          <div className="text-lg font-bold text-uemf-blue">
            {user.firstName} {user.lastName}
          </div>
          <div className="text-xs text-slate-500">{user.establishment}</div>
          {user.program && (
            <div className="text-xs text-slate-500">{user.program}</div>
          )}
        </div>
      </Card>

      {/* Info rows */}
      <Card className="!p-0">
        <Row icon={Hash} label="Matricule" value={user.matricule} />
        <Row icon={Mail} label="Email" value={user.email} />
        <Row icon={GraduationCap} label="Établissement" value={user.establishment} />
        <Row
          icon={User}
          label="Rôle"
          value={
            { student: 'Étudiant', admin: 'Admin', super_admin: 'Super-admin' }[
              user.role
            ]
          }
        />
      </Card>

      {/* Wallet glance */}
      <Card>
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Solde carte étudiant
        </div>
        <div className="mt-1 text-2xl font-black text-pogo-700">
          {formatMoney(user.walletBalanceCentimes)}
        </div>
      </Card>

      <Button
        variant="secondary"
        size="lg"
        fullWidth
        onClick={handleLogout}
        
      >
        <LogOut className="h-5 w-5" />
        Déconnexion
      </Button>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-3 last:border-0">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        <Icon className="h-4 w-4" />
      </span>
      <div className="flex-1">
        <div className="text-[11px] uppercase tracking-wider text-slate-500">
          {label}
        </div>
        <div className="text-sm font-bold text-slate-800">{value}</div>
      </div>
    </div>
  );
}
