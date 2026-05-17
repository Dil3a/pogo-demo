import { AppShell } from '@/components/layout/AppShell';

/**
 * Route-group layout for authenticated student pages.
 *
 * Putting AppShell here means /map, /scan, /history, /wallet, /profile,
 * /ride/[id] all share the same brand header and bottom nav without each
 * page re-importing it.
 */
export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
