import { cache } from 'react';

/**
 * React cache() deduplicates identical fetches within a single render pass.
 * If two server components both call getCachedUser(), only one fetch fires.
 * Cache is automatically cleared between requests.
 */

export const getCachedSession = cache(async () => {
  // In production: verify JWT, return user or null
  // In mock: just return a flag that session exists (cookie check happens in middleware)
  return { authenticated: true };
});
