import { z } from 'zod';

/**
 * Validated environment variables.
 *
 * Why validate at import time:
 *   - Production crashes loudly on missing config, not silently with `undefined`.
 *   - Single source of truth — IDE autocomplete, no string-typed lookups elsewhere.
 *   - Type-narrowed: `env.NEXT_PUBLIC_USE_MOCK_API` is `boolean`, not `string | undefined`.
 *
 * Server-only variables must NOT be prefixed `NEXT_PUBLIC_` — Next.js refuses to bundle
 * them into client code, which is the safety we want.
 */

const clientSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().default('POGO'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_API_BASE_URL: z.string().default('/api/mock'),
  NEXT_PUBLIC_WS_URL: z.string().default('ws://localhost:3000/realtime'),
  NEXT_PUBLIC_USE_MOCK_API: z.coerce.boolean().default(true),
  NEXT_PUBLIC_MAP_STYLE_URL: z
    .string()
    .url()
    .default('https://demotiles.maplibre.org/style.json'),
  NEXT_PUBLIC_CAMPUS_LAT: z.coerce.number().default(33.9716),
  NEXT_PUBLIC_CAMPUS_LNG: z.coerce.number().default(-5.0023),
  NEXT_PUBLIC_CAMPUS_ZOOM: z.coerce.number().default(16),
});

// We pick keys explicitly so Next.js inlines them at build time.
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
