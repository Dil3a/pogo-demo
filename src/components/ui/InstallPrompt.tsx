'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<unknown>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    // Check iOS
    const ios = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    setIsIOS(ios);

    // Android install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    });

    // Show iOS instructions after 3s if not installed
    if (ios) setTimeout(() => setShow(true), 3000);
  }, []);

  async function install() {
    if (deferredPrompt) {
      const prompt = deferredPrompt as { prompt: () => void; userChoice: Promise<{ outcome: string }> };
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') setShow(false);
    }
  }

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed', bottom: '80px', left: '12px', right: '12px', zIndex: 300,
      background: '#003A7A', borderRadius: '16px', padding: '14px 16px',
      boxShadow: '0 8px 32px rgba(0,58,122,.4)',
      display: 'flex', alignItems: 'flex-start', gap: '12px',
      animation: 'slideUp .3s ease',
    }}>
      <style>{`@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Download style={{ width: '20px', height: '20px', color: '#00c9b1' }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'Syne,sans-serif', fontWeight: 700, fontSize: '13px', color: '#fff', marginBottom: '3px' }}>
          Installer POGO
        </div>
        {isIOS ? (
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.8)', lineHeight: 1.5 }}>
            Appuyez sur <strong>Partager</strong> puis <strong>Sur l'écran d'accueil</strong>
          </div>
        ) : (
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.8)', lineHeight: 1.5 }}>
            Installez l'app pour un accès rapide depuis votre écran d'accueil
          </div>
        )}
        {!isIOS && (
          <button
            onClick={install}
            style={{ marginTop: '8px', background: '#00c9b1', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontFamily: 'Syne,sans-serif', fontWeight: 700, cursor: 'pointer' }}
          >
            Installer
          </button>
        )}
      </div>
      <button onClick={() => setShow(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.6)', flexShrink: 0 }}>
        <X style={{ width: '18px', height: '18px' }} />
      </button>
    </div>
  );
}
