'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, LogOut, Mail, GraduationCap, Hash, Download, Share } from 'lucide-react';
import { Card, Skeleton } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { useMe, useLogout } from '@/hooks/useAuth';
import { formatMoney } from '@/lib/format/money';

export default function ProfilePage() {
  const router = useRouter();
  const { data: user, isLoading } = useMe();
  const logout = useLogout();
  const [installPrompt, setInstallPrompt] = useState<unknown>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if already installed as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const ios = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    setIsIOS(ios);

    // Capture Android install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function handleInstall() {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }
    if (installPrompt) {
      const prompt = installPrompt as { prompt: () => void; userChoice: Promise<{ outcome: string }> };
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') setIsInstalled(true);
    }
  }

  function handleLogout() {
    logout.mutate();
    router.push('/login');
  }

  if (isLoading || !user) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    );
  }

  const initials = `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();

  return (
    <div className="flex flex-col gap-5">
      {/* Identity */}
      <Card className="flex items-center gap-4 !bg-gradient-to-br !from-uemf-blue/5 !to-uemf-green/5">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-uemf-blue to-uemf-green text-xl font-black text-white">
          {initials}
        </div>
        <div>
          <div className="text-lg font-bold text-uemf-blue">
            {user.firstName} {user.lastName}
          </div>
          <div className="text-xs text-slate-500">{user.establishment}</div>
          {user.program && <div className="text-xs text-slate-500">{user.program}</div>}
        </div>
      </Card>

      {/* Info rows */}
      <Card className="!p-0">
        <Row icon={Hash} label="Matricule" value={user.matricule} />
        <Row icon={Mail} label="Email" value={user.email} />
        <Row icon={GraduationCap} label="Établissement" value={user.establishment} />
        <Row icon={User} label="Rôle" value={{ student: 'Étudiant', admin: 'Admin', super_admin: 'Super-admin' }[user.role]} />
      </Card>

      {/* Wallet */}
      <Card>
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Solde carte étudiant</div>
        <div className="mt-1 text-2xl font-black text-pogo-700">{formatMoney(user.walletBalanceCentimes)}</div>
      </Card>

      {/* Install App */}
      {!isInstalled && (
        <Card className="!bg-gradient-to-br !from-uemf-blue !to-uemf-green !border-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Download className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Installer l'application</div>
              <div className="text-xs text-white/80">Accès rapide depuis votre écran d'accueil</div>
            </div>
          </div>

          {showIOSInstructions ? (
            <div className="bg-white/15 rounded-xl p-3 text-xs text-white/90 leading-relaxed">
              <div className="font-bold mb-2">📱 Sur iPhone/iPad :</div>
              <div>1. Appuyez sur <Share className="inline h-3 w-3" /> <strong>Partager</strong> en bas de Safari</div>
              <div>2. Faites défiler et appuyez sur <strong>"Sur l'écran d'accueil"</strong></div>
              <div>3. Appuyez sur <strong>Ajouter</strong></div>
              <button
                onClick={() => setShowIOSInstructions(false)}
                className="mt-2 text-white/60 underline"
              >
                Fermer
              </button>
            </div>
          ) : (
            <button
              onClick={handleInstall}
              style={{
                width: '100%', height: '44px', background: 'rgba(255,255,255,.2)',
                border: '1.5px solid rgba(255,255,255,.4)', borderRadius: '12px',
                color: '#fff', fontFamily: 'Syne,sans-serif', fontWeight: 700,
                fontSize: '14px', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              <Download className="h-4 w-4" />
              {isIOS ? 'Voir les instructions' : 'Installer POGO'}
            </button>
          )}
        </Card>
      )}

      {isInstalled && (
        <div className="text-center text-xs text-slate-500 bg-white rounded-xl p-3 border border-slate-100">
          ✅ POGO est installé sur votre appareil
        </div>
      )}

      <Button variant="secondary" size="lg" fullWidth onClick={handleLogout}>
        <LogOut className="h-5 w-5" />
        Déconnexion
      </Button>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-3 last:border-0">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        <Icon className="h-4 w-4" />
      </span>
      <div className="flex-1">
        <div className="text-[11px] uppercase tracking-wider text-slate-500">{label}</div>
        <div className="text-sm font-bold text-slate-800">{value}</div>
      </div>
    </div>
  );
}
