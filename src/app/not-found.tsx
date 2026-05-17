import Link from 'next/link';
import { Button } from '@/components/ui/Button';

/**
 * 404 — the user landed on an unknown route.
 * Keeps the brand chrome simple and offers a way back to /map.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <div className="text-7xl font-black text-uemf-blue/15">404</div>
      <h1 className="mt-2 text-2xl font-bold text-uemf-blue">Page introuvable</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        La page que vous recherchez n&apos;existe pas ou a été déplacée.
      </p>
      <Link href="/map" className="mt-6">
        <Button variant="uemf" size="lg">
          Retour à la carte
        </Button>
      </Link>
    </div>
  );
}
