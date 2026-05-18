import { redirect } from 'next/navigation';

/**
 * Root page — redirect to login.
 * Login will redirect to /portail if already authenticated.
 */
export default function RootPage() {
  redirect('/login');
}
