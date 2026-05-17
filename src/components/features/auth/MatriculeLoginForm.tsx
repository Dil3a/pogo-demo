'use client';

/**
 * MatriculeLoginForm — the dev/staging entry point.
 *
 * In production, students authenticate via SAML SSO against UEMF's IdP (cf.
 * ARCHITECTURE.md §6.1). This form exists so that during development we can
 * sign in by typing a matricule. Same regex as the portal: exactly 7 digits.
 *
 * Validation strategy:
 *   - We strip non-digits on input so a paste of "1234-567" works.
 *   - Hint text appears under-input as the user types.
 *   - Submit is blocked client-side AND validated again server-side (the API
 *     route uses MatriculeSchema, so this is defence in depth).
 */

import { useState } from 'react';
import { LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useLoginWithMatricule } from '@/hooks/useAuth';
import { MatriculeRegex } from '@/types/domain';

export function MatriculeLoginForm() {
  const router = useRouter();
  const [matricule, setMatricule] = useState('');
  const [touched, setTouched] = useState(false);
  const login = useLoginWithMatricule();

  const isValid = MatriculeRegex.test(matricule);
  const showError = touched && matricule.length > 0 && !isValid;

  function handleChange(v: string) {
    const digitsOnly = v.replace(/\D/g, '').slice(0, 7);
    setMatricule(digitsOnly);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!isValid) return;
    try {
      await login.mutateAsync(matricule);
      toast.success('Connexion réussie');
      router.push('/map');
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Connexion impossible. Vérifiez votre matricule.',
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Numéro de matricule"
        placeholder="1234567"
        inputMode="numeric"
        autoComplete="username"
        maxLength={7}
        value={matricule}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={() => setTouched(true)}
        hint={
          showError ? undefined : 'Votre matricule étudiant UEMF à 7 chiffres'
        }
        error={
          showError
            ? 'Le matricule doit comporter exactement 7 chiffres.'
            : undefined
        }
      />
      <Button
        type="submit"
        size="lg"
        variant="uemf"
        fullWidth
        disabled={!isValid}
        loading={login.isPending}
      >
        <LogIn className="h-5 w-5" />
        Se connecter
      </Button>
      <p className="text-center text-xs text-slate-500">
        En production, la connexion se fait via le SSO UEMF.
      </p>
    </form>
  );
}
