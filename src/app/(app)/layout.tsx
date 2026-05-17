import { Suspense } from 'react';
import { AppShell } from '@/components/layout/AppShell';

/**
 * Route-group layout for authenticated student pages.
 * Uses Suspense for streaming — pages load progressively instead of blocking.
 */
export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      <Suspense fallback={
        <div className="flex flex-col gap-4 p-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      }>
        {children}
      </Suspense>
    </AppShell>
  );
}
