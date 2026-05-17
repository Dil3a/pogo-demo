/**
 * Login page — entry point for unauthenticated users.
 *
 * Layout: centred card with UEMF + POGO branding above the form. The
 * background uses the same gradient as the authenticated shell so the visual
 * transition from /login → /map feels seamless.
 */

import { Card } from '@/components/ui';
import { BrandPogo } from '@/components/ui/Brand';
import { MatriculeLoginForm } from '@/components/features/auth/MatriculeLoginForm';

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <div
          className="flex items-center justify-center rounded-3xl px-6 py-4 shadow-xl shadow-uemf-blue/20"
          style={{
            background:
              'linear-gradient(135deg, #003A7A 0%, #1565c0 60%, #1a8a3a 100%)',
          }}
        >
          <BrandPogo size="lg" withTagline />
        </div>
      </div>

      <Card className="w-full max-w-sm">
        <h1 className="mb-1 text-lg font-bold text-uemf-blue">Connexion</h1>
        <p className="mb-5 text-xs text-slate-500">
          Identifiez-vous avec votre matricule étudiant UEMF pour réserver une
          trottinette.
        </p>
        <MatriculeLoginForm />
      </Card>

      <p className="mt-6 max-w-sm text-center text-xs text-slate-500">
        Service réservé aux étudiants et personnels de l&apos;Université
        Euromed de Fès.
      </p>
    </div>
  );
}
