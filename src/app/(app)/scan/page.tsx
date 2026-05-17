'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Keyboard, Camera } from 'lucide-react';
import { Card } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRideStore } from '@/stores/ride.store';
import { getClientStore } from '@/lib/client-store';

export default function ScanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectScooter = useRideStore((s) => s.selectScooter);
  const [manualMode, setManualMode] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const scannerRef = useRef<unknown>(null);
  const scannerDivId = 'qr-reader';

  // Handle QR URL params from printed stickers — auto-open reservation
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) handleCode(code);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => { stopScanner(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleCode(rawCode: string) {
    let code = rawCode.trim().toUpperCase();
    try {
      const url = new URL(rawCode);
      const param = url.searchParams.get('code');
      if (param) code = param.toUpperCase();
    } catch { /* not a URL */ }

    // Normalize: "01" → "T-01", "T01" → "T-01"
    if (/^\d{1,2}$/.test(code)) code = 'T-' + code.padStart(2, '0');
    if (/^T\d{2}$/.test(code)) code = code[0] + '-' + code.slice(1);

    stopScanner();
    setSubmitting(true);

    const store = getClientStore();
    const scooter = store.scooters.find((s) => s.code === code);

    if (!scooter) {
      toast.error(`Code "${code}" introuvable.`);
      setSubmitting(false);
      return;
    }
    if (scooter.status !== 'available') {
      toast.error(`${scooter.code} non disponible.`);
      setSubmitting(false);
      return;
    }

    selectScooter(scooter);
    toast.success(`${scooter.code} détectée !`);
    setSubmitting(false);
    router.push('/map');
  }

  async function startScanner() {
    setCameraError('');
    setScanning(true);

    // Dynamically import html5-qrcode to avoid SSR issues
    const { Html5Qrcode } = await import('html5-qrcode');

    const scanner = new Html5Qrcode(scannerDivId);
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // Success callback
          handleCode(decodedText);
        },
        () => {
          // Error callback — fires constantly while scanning, ignore
        }
      );
    } catch (err) {
      setScanning(false);
      setCameraError('Impossible d\'accéder à la caméra. Utilisez la saisie manuelle.');
      setManualMode(true);
      console.error('Camera error:', err);
    }
  }

  function stopScanner() {
    if (scannerRef.current) {
      const scanner = scannerRef.current as { stop: () => Promise<void>; clear: () => void };
      scanner.stop().then(() => {
        scanner.clear();
        scannerRef.current = null;
        setScanning(false);
      }).catch(() => {
        scannerRef.current = null;
        setScanning(false);
      });
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-lg font-bold text-uemf-blue">Scanner une trottinette</h1>
        <p className="text-xs text-slate-500">
          Scannez le QR code sur la trottinette ou entrez le code manuellement.
        </p>
      </div>

      {manualMode ? (
        <Card>
          <div className="flex flex-col gap-4">
            <Input
              label="Code de la trottinette"
              placeholder="T-01"
              autoFocus
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase().slice(0, 6))}
              hint="Format : T-XX (ex: T-01, T-02...)"
            />
            {cameraError && (
              <p className="text-xs text-red-500">{cameraError}</p>
            )}
            <Button
              variant="uemf"
              fullWidth
              size="lg"
              loading={submitting}
              disabled={!/^T-\d{2}$/.test(manualCode)}
              onClick={() => handleCode(manualCode)}
            >
              Continuer
            </Button>
            <button
              type="button"
              onClick={() => { setManualMode(false); setTimeout(startScanner, 100); }}
              className="flex items-center justify-center gap-2 text-sm text-slate-500"
            >
              <Camera className="h-4 w-4" />
              Utiliser la caméra
            </button>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="flex flex-col items-center gap-4">
            {/* html5-qrcode renders into this div */}
            <div
              id={scannerDivId}
              style={{ width: '100%', maxWidth: '320px' }}
            />

            {!scanning && (
              <Button
                variant="uemf"
                fullWidth
                size="lg"
                onClick={startScanner}
                loading={submitting}
              >
                <Camera className="h-5 w-5" />
                Démarrer la caméra
              </Button>
            )}

            {scanning && (
              <p className="text-xs text-slate-500 text-center">
                Pointez vers le QR code de la trottinette
              </p>
            )}

            <button
              type="button"
              onClick={() => { stopScanner(); setManualMode(true); }}
              className="flex items-center justify-center gap-2 text-sm text-slate-500"
            >
              <Keyboard className="h-4 w-4" />
              Saisir le code manuellement
            </button>
          </div>
        </Card>
      )}

      {/* Quick access */}
      <Card className="bg-slate-50">
        <div className="text-xs font-semibold text-slate-700 mb-3">
          🛴 Accès rapide — trottinettes disponibles
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {getClientStore().scooters
            .filter((s) => s.status === 'available')
            .map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleCode(s.code)}
                style={{
                  border: '1.5px solid #a7f3d0',
                  background: '#f0fdf9',
                  borderRadius: '8px',
                  padding: '5px 12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#008c7c',
                  cursor: 'pointer',
                  fontFamily: 'Syne, sans-serif',
                }}
              >
                {s.code}
              </button>
            ))}
        </div>
      </Card>
    </div>
  );
}
