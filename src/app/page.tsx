import { redirect } from 'next/navigation';

/**
 * Root route — redirects to /map when authenticated, /login otherwise.
 * Middleware handles the actual session check; this is just a shortcut so
 * `/` doesn't 404.
 */
export default function Home() {
  redirect('/map');
}
