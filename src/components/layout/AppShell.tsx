'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Map, Scan, History, Wallet, User, ChevronLeft } from 'lucide-react';
import { useMe, useLogout } from '@/hooks/useAuth';
import { getSession } from '@/lib/session';
import { cn } from '@/lib/cn';
import { InstallPrompt } from '@/components/ui/InstallPrompt';
import { useRideExpiry } from '@/hooks/useRideExpiry';

const NAV_ITEMS = [
  { href: '/map',     label: 'Carte',    icon: Map },
  { href: '/scan',    label: 'Scanner',  icon: Scan },
  { href: '/history', label: 'Trajets',  icon: History },
  { href: '/wallet',  label: 'Solde',    icon: Wallet },
  { href: '/profile', label: 'Profil',   icon: User },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user } = useMe();
  const logout = useLogout();
  useRideExpiry();

  // Auth guard — redirect to login if no session
  useEffect(() => {
    const session = getSession();
    if (!session) router.replace('/login');
  }, [router]);

  const initials = user
    ? `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase()
    : '··';

  return (
    <div className="flex min-h-dvh flex-col" style={{ background: '#f0f4f8' }}>

      {/* ── TOPBAR ── */}
      <header style={{ background: '#003A7A', flexShrink: 0 }}>
        <div className="flex h-14 items-center justify-between px-4">

          {/* Left — Back to portal + POGO */}
          <div className="flex items-center gap-2">
            {/* Back to portal */}
            <Link
              href="/portail"
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors"
              style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.2)' }}
              title="Retour au portail UEMF"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Portail</span>
            </Link>

            <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)' }} />

            {/* POGO brand */}
            <Link href="/map" className="flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 200 200">
                <rect width="200" height="200" rx="40" fill="rgba(255,255,255,0.15)" />
                <circle cx="100" cy="100" r="60" fill="white" />
                <circle cx="100" cy="100" r="34" fill="#00c9b1" />
                <circle cx="100" cy="100" r="14" fill="white" />
              </svg>
              <div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '14px', fontWeight: 800, color: '#fff', letterSpacing: '2px', lineHeight: 1 }}>POGO</div>
                <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.6)', marginTop: '1px', lineHeight: 1 }}>Campus UEMF · Fès</div>
              </div>
            </Link>
          </div>

          {/* Right — user avatar */}
          <Link
            href="/profile"
            style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: 700, color: '#fff',
            }}
          >
            {initials}
          </Link>
        </div>

        {/* Partnership bar */}
        <div style={{ background: '#1a8a3a', padding: '3px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00c9b1', flexShrink: 0 }} />
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
            Plateforme officielle de mobilité douce · Partenariat UEMF
          </span>
        </div>
      </header>

      {/* ── CONTENT ── */}
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="mx-auto w-full max-w-2xl px-4 py-5">{children}</div>
      </main>

      {/* ── BOTTOM NAV ── */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-md">
        <ul className="mx-auto flex max-w-2xl">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center gap-1 py-3 text-[10px] font-semibold transition-colors',
                    active ? 'text-pogo-600' : 'text-slate-400 hover:text-uemf-blue',
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <InstallPrompt />
    </div>
  );
}
