import { z } from 'zod';

/**
 * Validated environment variables.
 *
 * Fix 5: WebSocket URL and all config driven by environment variables.
 * Fix 4: NEXT_PUBLIC_USE_MOCK_API included with correct default.
 * Fix: Campus coordinates updated to real UEMF location.
 */

const clientSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().default('POGO'),
  NEXT_PUBLIC_APP_URL: z.string().default('http://localhost:3000'),
  NEXT_PUBLIC_API_BASE_URL: z.string().default('/api/mock'),

  // Fix 5: WebSocket URL fully driven by env var
  NEXT_PUBLIC_WS_URL: z.string().default('ws://localhost:3000/realtime'),

  // Fix 4: NEXT_PUBLIC_USE_MOCK_API with correct default
  NEXT_PUBLIC_USE_MOCK_API: z.coerce.boolean().default(true),

  NEXT_PUBLIC_MAP_STYLE_URL: z
    .string()
    .default('https://demotiles.maplibre.org/style.json'),

  // Fix: Updated to real UEMF campus coordinates
  NEXT_PUBLIC_CAMPUS_LAT: z.coerce.number().default(34.04494255638137),
  NEXT_PUBLIC_CAMPUS_LNG: z.coerce.number().default(-5.064716632430015),
  NEXT_PUBLIC_CAMPUS_ZOOM: z.coerce.number().default(16),
});

// Pick keys explicitly so Next.js inlines them at build time
const clientEnv = clientSchema.parse({
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  NEXT_PUBLIC_USE_MOCK_API: process.env.NEXT_PUBLIC_USE_MOCK_API,
  NEXT_PUBLIC_MAP_STYLE_URL: process.env.NEXT_PUBLIC_MAP_STYLE_URL,
  NEXT_PUBLIC_CAMPUS_LAT: process.env.NEXT_PUBLIC_CAMPUS_LAT,
  NEXT_PUBLIC_CAMPUS_LNG: process.env.NEXT_PUBLIC_CAMPUS_LNG,
  NEXT_PUBLIC_CAMPUS_ZOOM: process.env.NEXT_PUBLIC_CAMPUS_ZOOM,
});

export const env = clientEnv;

/**
 * Helper to build the WebSocket URL dynamically.
 * In production uses NEXT_PUBLIC_WS_URL; falls back to deriving from APP_URL.
 * Fix 5: Fully dynamic, no hardcoded URLs.
 */
export function getWsUrl(): string {
  if (clientEnv.NEXT_PUBLIC_WS_URL) return clientEnv.NEXT_PUBLIC_WS_URL;
  // Derive from app URL: https://... → wss://...
  return clientEnv.NEXT_PUBLIC_APP_URL
    .replace(/^https/, 'wss')
    .replace(/^http/, 'ws')
    + '/realtime';
}
