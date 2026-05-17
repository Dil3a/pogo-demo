'use client';

/**
 * AdminShell — chrome for the admin panel.
 *
 * Admin is separate from the student app (different route group `(admin)/`)
 * because:
 *   1. The audience is operations / SI, who get a desktop-first layout.
 *   2. We can mount it under a separate subdomain later (admin.pogo.uemf.ma)
 *      with stricter auth (mTLS + role check) without breaking student routes.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bike, ScrollText, Gauge, LogOut } from 'lucide-react';
import { BrandPogo } from '@/components/ui/Brand';
import { cn } from '@/lib/cn';
import { useLogout } from '@/hooks/useAuth';

const NAV = [
  { href: '/admin', label: 'Tableau de bord', icon: Gauge },
  { href: '/admin/fleet', label: 'Flotte', icon: Bike },
  { href: '/admin/rides', label: 'Trajets', icon: ScrollText },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const logout = useLogout();

  return (
    <div className="flex min-h-dvh bg-slate-50">
      <aside className="hidden w-64 flex-col bg-uemf-blue text-white md:flex">
        <div className="flex h-14 items-center px-4">
          <BrandPogo size="sm" />
        </div>
        <div className="border-t border-white/10" />
        <nav className="flex-1 py-4">
          {NAV.map((item) => {
            const active =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'mx-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors',
                  active
                    ? 'bg-pogo-500 text-white shadow'
                    : 'text-white/80 hover:bg-white/10 hover:text-white',
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={() => logout.mutate()}
          className="mx-2 mb-3 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </aside>

      {/* Mobile: top brand bar, no sidebar */}
      <div className="flex flex-1 flex-col">
        <div className="flex h-14 items-center justify-between border-b border-slate-200 bg-uemf-blue px-4 md:hidden">
          <BrandPogo size="sm" />
        </div>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
