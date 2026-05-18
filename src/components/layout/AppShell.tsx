'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, Scan, History, Wallet, User } from 'lucide-react';
import { useMe } from '@/hooks/useAuth';
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
  const { data: user } = useMe();

  useRideExpiry();
  const initials = user
    ? `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase()
    : '··';

  return (
    <div className="flex min-h-dvh flex-col" style={{ background: '#f0f4f8' }}>

      {/* ── TOPBAR ── */}
      <header style={{ background: '#003A7A', flexShrink: 0 }}>

        {/* Main header row */}
        <div className="flex h-14 items-center justify-between px-4">

          {/* Left — UEMF × POGO */}
          <Link href="/map" className="flex items-center gap-2.5">
            {/* UEMF badge */}
            <div style={{ background: '#fff', borderRadius: '8px', padding: '4px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#003A7A', letterSpacing: '0.5px' }}>UEMF</span>
              <span style={{ fontSize: '7px', color: '#1a8a3a', fontWeight: 700, marginTop: '1px' }}>Université</span>
            </div>
            {/* × */}
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '16px', fontWeight: 300, lineHeight: 1 }}>×</span>
            {/* POGO */}
            <div className="flex items-center gap-2">
              <svg width="26" height="26" viewBox="0 0 200 200">
                <rect width="200" height="200" rx="40" fill="rgba(255,255,255,0.15)" />
                <circle cx="100" cy="100" r="60" fill="white" />
                <circle cx="100" cy="100" r="34" fill="#00c9b1" />
                <circle cx="100" cy="100" r="14" fill="white" />
              </svg>
              <div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '15px', fontWeight: 800, color: '#fff', letterSpacing: '2px', lineHeight: 1 }}>POGO</div>
                <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.6)', marginTop: '1px', lineHeight: 1 }}>Campus UEMF · Fès</div>
              </div>
            </div>
          </Link>

          {/* Right — user */}
          <div className="flex items-center gap-2">
            {user && (
              <div className="hidden text-right sm:block">
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#fff', lineHeight: 1.2 }}>{user.firstName} {user.lastName}</div>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.6)' }}>{user.matricule}</div>
              </div>
            )}
            <Link
              href="/profile"
              style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#fff' }}
              aria-label="Profil"
            >
              {initials}
            </Link>
          </div>
        </div>

        {/* Partnership banner */}
        <div style={{ background: '#1a8a3a', padding: '4px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00c9b1', flexShrink: 0 }} />
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.9)', fontWeight: 600, letterSpacing: '0.3px' }}>
            Plateforme officielle de mobilité douce · Partenariat UEMF
          </span>
        </div>
      </header>

      {/* ── CONTENT ── */}
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="mx-auto w-full max-w-2xl px-4 py-5">{children}</div>
      </main>

      {/* ── BOTTOM NAV ── */}
      <nav
        aria-label="Navigation principale"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-md"
      >
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
                  <Icon className={cn('h-5 w-5', active && 'drop-shadow-[0_0_8px_rgba(0,201,177,0.4)]')} />
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
