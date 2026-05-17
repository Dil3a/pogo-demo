import { z } from 'zod';

/**
 * QR payload helpers.
 *
 * Production stickers encode a signed URL like:
 *   https://pogo.uemf.ac.ma/s/T-01?sig=eyJhbGc...&kv=1
 *
 * We accept three input shapes for flexibility during dev:
 *   1. Full URL (production stickers)
 *   2. JSON blob (legacy / testing)
 *   3. Raw scooter code "T-01" (for keyboard / barcode reader fallback)
 */

export interface ParsedQrPayload {
  scooterCode: string;
  signature: string;
  keyVersion: string;
}

const ParsedUrlSchema = z.object({
  scooterCode: z.string().regex(/^T-\d{2,3}$/, 'Invalid scooter code format'),
  signature: z.string().min(1),
  keyVersion: z.string().default('1'),
});

/**
 * Parse a QR scan result into a structured payload.
 * Throws Error with user-facing French message on invalid input.
 */
export function parseQrPayload(raw: string): ParsedQrPayload {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    throw new Error('QR code vide');
  }

  // Case 1: URL form
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    let url: URL;
    try {
      url = new URL(trimmed);
    } catch {
      throw new Error('URL du QR code invalide');
    }
    // Expecting /s/{code} or /scooter/{code}
    const match = url.pathname.match(/^\/(?:s|scooter)\/([A-Z]-\d{2,3})$/i);
    if (!match) {
      throw new Error('Ce QR code ne correspond pas à une trottinette POGO');
    }
    const scooterCode = match[1]!.toUpperCase();
    const signature = url.searchParams.get('sig');
    if (!signature) {
      throw new Error('Signature manquante — le QR code est invalide ou périmé');
    }
    const keyVersion = url.searchParams.get('kv') ?? '1';
    return ParsedUrlSchema.parse({ scooterCode, signature, keyVersion });
  }

  // Case 2: JSON blob
  if (trimmed.startsWith('{')) {
    try {
      const obj = JSON.parse(trimmed);
      return ParsedUrlSchema.parse(obj);
    } catch {
      throw new Error('Format JSON invalide');
    }
  }

  // Case 3: raw code (dev fallback only — accept but mark signature as "DEV")
  if (/^T-\d{2,3}$/i.test(trimmed)) {
    return {
      scooterCode: trimmed.toUpperCase(),
      signature: 'DEV',
      keyVersion: '0',
    };
  }

  throw new Error('QR code non reconnu');
}

/**
 * Check camera permission state without prompting the user.
 * Returns 'granted', 'denied', 'prompt', or 'unsupported'.
 */
export async function getCameraPermissionState(): Promise<
  'granted' | 'denied' | 'prompt' | 'unsupported'
> {
  if (typeof navigator === 'undefined' || !('permissions' in navigator)) {
    return 'unsupported';
  }
  try {
    // `camera` is in the Permissions API spec but isn't supported everywhere.
    // We gracefully degrade to 'prompt' if the query throws.
    const result = await navigator.permissions.query({
      name: 'camera' as PermissionName,
    });
    return result.state;
  } catch {
    return 'prompt';
  }
}

/** Detect whether the runtime has a camera at all (excludes some desktops). */
export async function hasAnyCamera(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices) return false;
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.some((d) => d.kind === 'videoinput');
  } catch {
    return false;
  }
}
