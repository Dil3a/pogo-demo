import { AdminShell } from '@/components/layout/AdminShell';

/**
 * Admin route-group layout. Wraps every /admin/* page in the operator chrome.
 * Role-based access control is enforced server-side in the API; the
 * middleware on the edge merely checks the session cookie exists.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
