'use client';
import { InstallPrompt } from '@/components/ui/InstallPrompt';

/**
 * AppShell — the chrome around every authenticated student page.
 *
 * Layout:
 *   - Top: UEMF + POGO brand bar (gradient #003A7A → #1565c0 → #1a8a3a as
 *     in the existing portal).
 *   - Middle: main content (children).
 *   - Bottom: 4-icon bottom nav for thumb-reach navigation on mobile.
 *
 * The same component is reused on desktop (where the bottom nav becomes a
 * floating left rail via Tailwind `sm:` classes).
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, Scan, History, Wallet } from 'lucide-react';
import { BrandPogo } from '@/components/ui/Brand';
import { useMe } from '@/hooks/useAuth';
import { cn } from '@/lib/cn';

const NAV_ITEMS = [
  { href: '/map', label: 'Carte', icon: Map },
  { href: '/scan', label: 'Scanner', icon: Scan },
  { href: '/history', label: 'Trajets', icon: History },
  { href: '/wallet', label: 'Solde', icon: Wallet },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: user } = useMe();

  const initials = user
    ? `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase()
    : '··';

  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-br from-slate-50 to-green-50/40">
      {/* Brand bar — same gradient as UEMF portal topbar */}
      <header
        className="flex h-14 items-center justify-between px-4 shadow-md shadow-uemf-blue/20"
        style={{
          background:
            'linear-gradient(90deg, #003A7A 0%, #1565c0 50%, #1a8a3a 100%)',
        }}
      >
        <Link href="/map" className="flex items-center">
          <BrandPogo size="sm" />
        </Link>
        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden text-right text-xs text-white/85 sm:block">
              <div className="font-semibold">
                {user.firstName} {user.lastName}
              </div>
              <div className="opacity-80">{user.matricule}</div>
            </div>
          )}
          <Link
            href="/profile"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-xs font-bold text-white"
            aria-label="Profil"
          >
            {initials}
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="mx-auto w-full max-w-2xl px-4 py-5">{children}</div>
      </main>

      {/* Bottom nav */}
      <nav
        aria-label="Navigation principale"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-md"
      >
        <ul className="mx-auto flex max-w-2xl">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center gap-1 py-3 text-[11px] font-semibold transition-colors',
                    active
                      ? 'text-pogo-600'
                      : 'text-slate-500 hover:text-uemf-blue',
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5',
                      active &&
                        'drop-shadow-[0_0_8px_rgba(0,201,177,0.4)]',
                    )}
                  />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
