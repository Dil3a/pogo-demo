'use client';

/**
 * Scan page — wraps the QrScanner with the post-decode flow:
 *
 *   1. User scans a QR sticker on a scooter deck (e.g. "T-03").
 *   2. We POST /scooters/T-03/scan to validate the code, check status, and get
 *      a fresh Scooter object back. The mock route accepts UUID or code.
 *   3. On success: push into the reservation funnel via `selectScooter`.
 *      The reservation modal (RidePanel) is rendered globally on the map page,
 *      so we navigate there and let the panel pop open.
 *
 * Manual entry is offered as a fallback when the camera fails or the sticker
 * is damaged. Same code → same endpoint → same flow.
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Keyboard, Camera } from 'lucide-react';
import { Card } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { QrScanner } from '@/components/features/qr/QrScanner';
import { fleet } from '@/lib/api/endpoints';
import { useRideStore } from '@/stores/ride.store';

export default function ScanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectScooter = useRideStore((s) => s.selectScooter);

  // Handle QR code URL params (from printed QR stickers)
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      handleCode(code);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [manualMode, setManualMode] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleCode(code: string, signature: string = 'manual') {
    setSubmitting(true);
    try {
      const scooter = await fleet.scanScooter(code.toUpperCase(), signature);
      if (scooter.status !== 'available') {
        toast.error(
          `Trottinette ${scooter.code} non disponible (${scooter.status}).`,
        );
        return;
      }
      selectScooter(scooter);
      toast.success(`${scooter.code} détectée — choisissez la durée`);
      router.push('/map'); // RidePanel auto-opens on /map.
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : 'Code introuvable. Vérifiez et réessayez.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-lg font-bold text-uemf-blue">
          Scanner une trottinette
        </h1>
        <p className="text-xs text-slate-500">
          Pointez la caméra vers le QR code sur le guidon ou la base de la
          trottinette.
        </p>
      </div>

      <Card>
        {manualMode ? (
          <div className="flex flex-col gap-4">
            <Input
              label="Code de la trottinette"
              placeholder="T-03"
              autoFocus
              value={manualCode}
              onChange={(e) =>
                setManualCode(e.target.value.toUpperCase().slice(0, 6))
              }
              hint="Format : T-XX (par exemple T-03)"
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
              onClick={() => setManualMode(false)}
              className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-uemf-blue"
            >
              <Camera className="h-4 w-4" />
              Utiliser la caméra
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <QrScanner onResult={handleCode} />
            <button
              type="button"
              onClick={() => setManualMode(true)}
              className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-uemf-blue"
            >
              <Keyboard className="h-4 w-4" />
              Saisir le code manuellement
            </button>
          </div>
        )}
      </Card>

      <Card className="bg-slate-50">
        <div className="text-xs font-semibold text-slate-700">
          Astuces pour scanner
        </div>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-600">
          <li>Tenez le téléphone bien droit et à 15-20 cm du QR.</li>
          <li>Évitez les reflets — un peu d&apos;ombre aide.</li>
          <li>Si le sticker est abîmé, utilisez la saisie manuelle.</li>
        </ul>
      </Card>
    </div>
  );
}
