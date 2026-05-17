'use client';

/**
 * QrScanner — wraps `html5-qrcode` with the boilerplate needed to make camera
 * access feel reliable across the browsers students will actually use on
 * campus (Chrome Android, Safari iOS, occasional desktop Firefox).
 *
 * Critical iOS Safari gotchas this component addresses:
 *
 *   1. `getUserMedia` must be triggered by a user gesture; that's why we
 *      render an explicit "Activer la caméra" button instead of auto-starting
 *      the camera on mount.
 *   2. The camera stream MUST be torn down on unmount, otherwise the camera
 *      LED stays on and other tabs can't access it. We call `clear()` in the
 *      cleanup function.
 *   3. `facingMode: 'environment'` doesn't work on all iOS versions if a
 *      specific deviceId was previously persisted. We always pass facingMode
 *      and let the library negotiate the deviceId.
 *   4. The scanner DIV must have a *fixed pixel size* — html5-qrcode reads
 *      offsetWidth at start time, and a flexbox-stretched parent gives it 0.
 */

import { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { parseQrPayload, hasAnyCamera } from '@/lib/qr/parse';

interface Props {
  /** Called with the parsed scooter code (e.g. "T-03") once a QR is decoded. */
  onResult: (code: string) => void;
  /** Called when an unrecoverable error occurs (no camera, permission denied). */
  onError?: (message: string) => void;
}

const SCANNER_ELEMENT_ID = 'pogo-qr-reader';

export function QrScanner({ onResult, onError }: Props) {
  const [active, setActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const scannerRef = useRef<{ clear: () => void | Promise<void> } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Clean up on unmount — the camera LED must go off.
  useEffect(() => {
     return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch {}
      }
    };
  }, []);

  async function start() {
    setErrorMsg(null);

    if (!(await hasAnyCamera())) {
      const msg = 'Aucune caméra détectée sur cet appareil.';
      setErrorMsg(msg);
      onError?.(msg);
      return;
    }

    // Dynamic import — html5-qrcode is ~50 KB and has no SSR support.
    const { Html5Qrcode } = await import('html5-qrcode');
    const instance = new Html5Qrcode(SCANNER_ELEMENT_ID);
    scannerRef.current = instance;

    try {
      await instance.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 240, height: 240 },
          aspectRatio: 1,
        },
        (decodedText) => {
          // Successful decode — parse, hand off, stop the camera.
          const code = parseQrPayload(decodedText);
          if (code) {
            instance.stop().then(() => {
              setActive(false);
              onResult(code.text);
            });
          }
        },
        // onError is called on every frame that doesn't contain a QR — noisy,
        // so we deliberately swallow it.
        () => {},
      );
      setActive(true);
    } catch (e) {
      const msg =
        e instanceof Error && /permission|denied/i.test(e.message)
          ? "Permission refusée. Activez l'accès à la caméra dans les paramètres du navigateur."
          : 'Impossible de démarrer la caméra. Vérifiez les permissions.';
      setErrorMsg(msg);
      onError?.(msg);
      setActive(false);
    }
  }

  async function stop() {
    if (scannerRef.current) {
      await scannerRef.current.clear();
      scannerRef.current = null;
    }
    setActive(false);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={containerRef}
        id={SCANNER_ELEMENT_ID}
        className="overflow-hidden rounded-2xl bg-slate-900"
        style={{ width: 280, height: 280 }}
      />
      {errorMsg && (
        <p className="max-w-xs text-center text-xs text-red-600">{errorMsg}</p>
      )}
      {!active ? (
        <Button onClick={start} size="lg">
          <Camera className="h-5 w-5" />
          Activer la caméra
        </Button>
      ) : (
        <Button onClick={stop} variant="secondary" size="lg">
          <CameraOff className="h-5 w-5" />
          Arrêter
        </Button>
      )}
      <p className="max-w-xs text-center text-xs text-slate-500">
        Placez le QR code de la trottinette dans le cadre. Le code commence
        par <span className="font-mono font-semibold">T-</span>.
      </p>
    </div>
  );
}
