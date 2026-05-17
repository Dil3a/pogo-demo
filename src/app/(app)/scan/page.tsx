'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Keyboard, Camera, ScanLine } from 'lucide-react';
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);

  // Handle QR URL params from printed stickers
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      handleCode(code);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleCode(rawCode: string) {
    // Extract scooter code from URL or plain code
    // Handles: "T-01", "t-01", "01", full URL with ?code=T-01
    let code = rawCode.trim().toUpperCase();

    // If it's a full URL, extract the code param
    try {
      const url = new URL(rawCode);
      const param = url.searchParams.get('code');
      if (param) code = param.toUpperCase();
    } catch { /* not a URL, use as-is */ }

    // Normalize: "01" → "T-01", "T01" → "T-01"
    if (/^\d{1,2}$/.test(code)) code = 'T-' + code.padStart(2, '0');
    if (/^T\d{2}$/.test(code)) code = code.slice(0,1) + '-' + code.slice(1);

    setSubmitting(true);
    stopCamera();

    // Look up from client store — no API call needed
    const store = getClientStore();
    const scooter = store.scooters.find((s) => s.code === code);

    if (!scooter) {
      toast.error(`Code "${code}" introuvable. Vérifiez et réessayez.`);
      setSubmitting(false);
      return;
    }
    if (scooter.status !== 'available') {
      toast.error(`Trottinette ${scooter.code} non disponible (${scooter.status}).`);
      setSubmitting(false);
      return;
    }

    selectScooter(scooter);
    toast.success(`${scooter.code} détectée — choisissez la durée`);
    setSubmitting(false);
    router.push('/map');
  }

  // ── CAMERA SCANNER ──────────────────────────────────────────────
  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setScanning(true);
      scanFrame();
    } catch {
      toast.error("Impossible d'accéder à la caméra. Utilisez la saisie manuelle.");
      setManualMode(true);
    }
  }

  function stopCamera() {
    cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setScanning(false);
  }

  async function scanFrame() {
    if (!videoRef.current || !streamRef.current) return;
    const video = videoRef.current;
    if (video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    // Use BarcodeDetector API (supported on Chrome Android, Safari 17+)
    if ('BarcodeDetector' in window) {
      try {
        // @ts-expect-error BarcodeDetector not in TS types yet
        const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
        const barcodes = await detector.detect(video);
        if (barcodes.length > 0) {
          handleCode(barcodes[0].rawValue);
          return;
        }
      } catch { /* keep scanning */ }
    }

    animFrameRef.current = requestAnimationFrame(scanFrame);
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-lg font-bold text-uemf-blue">Scanner une trottinette</h1>
        <p className="text-xs text-slate-500">
          Scannez le QR code sur la trottinette ou entrez le code manuellement.
        </p>
      </div>

      <Card>
        {manualMode ? (
          <div className="flex flex-col gap-4">
            <Input
              label="Code de la trottinette"
              placeholder="T-01"
              autoFocus
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase().slice(0, 6))}
              hint="Format : T-XX (par exemple T-01, T-02...)"
            />
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
              onClick={() => { setManualMode(false); startCamera(); }}
              className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-uemf-blue"
            >
              <Camera className="h-4 w-4" />
              Utiliser la caméra
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            {/* Camera view */}
            <div style={{ position:'relative', width:'100%', maxWidth:'320px', aspectRatio:'1', borderRadius:'14px', overflow:'hidden', background:'#000' }}>
              <video
                ref={videoRef}
                style={{ width:'100%', height:'100%', objectFit:'cover' }}
                playsInline
                muted
              />
              {/* Scan overlay */}
              <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <div style={{ width:'200px', height:'200px', border:'2px solid #00c9b1', borderRadius:'12px', boxShadow:'0 0 0 9999px rgba(0,0,0,.4)' }}>
                  <ScanLine style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', color:'#00c9b1', width:'32px', height:'32px' }} />
                </div>
              </div>
              {!scanning && (
                <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,.6)', borderRadius:'14px' }}>
                  <button
                    type="button"
                    onClick={startCamera}
                    style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'8px', color:'#fff', background:'none', border:'none', cursor:'pointer' }}
                  >
                    <Camera style={{ width:'40px', height:'40px' }} />
                    <span style={{ fontSize:'13px', fontWeight:700 }}>Appuyez pour démarrer</span>
                  </button>
                </div>
              )}
            </div>

            {scanning && (
              <p className="text-xs text-slate-500 text-center">
                Pointez vers le QR code de la trottinette
              </p>
            )}

            <button
              type="button"
              onClick={() => { stopCamera(); setManualMode(true); }}
              className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-uemf-blue"
            >
              <Keyboard className="h-4 w-4" />
              Saisir le code manuellement
            </button>
          </div>
        )}
      </Card>

      {/* Quick access — available scooters */}
      <Card className="bg-slate-50">
        <div className="text-xs font-semibold text-slate-700 mb-3">
          🛴 Trottinettes disponibles — accès rapide
        </div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
          {getClientStore().scooters
            .filter((s) => s.status === 'available')
            .map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleCode(s.code)}
                style={{ border:'1.5px solid #a7f3d0', background:'#f0fdf9', borderRadius:'8px', padding:'5px 12px', fontSize:'12px', fontWeight:700, color:'#008c7c', cursor:'pointer', fontFamily:'Syne,sans-serif' }}
              >
                {s.code}
              </button>
            ))}
        </div>
      </Card>
    </div>
  );
}
