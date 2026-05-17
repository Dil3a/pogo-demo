/**
 * Formatting helpers for fr-MA (French as spoken in Morocco).
 *
 * The Moroccan Dirham (MAD/DHS) is unusual: ISO code is MAD, but the symbol
 * universally shown to users — and in the existing UEMF portal — is "DHS".
 * We honor that here and ignore Intl's default symbol.
 */

/** Format an integer centime amount as "5 DHS", "20 DHS", "1 234 DHS". */
export function formatMoney(centimes: number): string {
  const dhs = Math.round(centimes / 100);
  // French uses non-breaking space as thousands separator.
  const formatted = dhs.toLocaleString('fr-FR').replace(/\s/g, '\u00A0');
  return `${formatted}\u00A0DHS`;
}

/** Format with explicit "+" sign for credits (wallet view). */
export function formatMoneySigned(centimes: number): string {
  const sign = centimes > 0 ? '+' : centimes < 0 ? '−' : '';
  return `${sign}${formatMoney(Math.abs(centimes))}`;
}

/** "16 mai 2026 à 10:30" — French style with non-breaking spaces. */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
}

/** "10:30" */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
}

/** "15 min", "2 h 30", "il y a 3 min". Compact French durations. */
export function formatDuration(ms: number): string {
  const totalMin = Math.round(ms / 60000);
  if (totalMin < 1) return 'maintenant';
  if (totalMin < 60) return `${totalMin}\u00A0min`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m === 0 ? `${h}\u00A0h` : `${h}\u00A0h\u00A0${m}`;
}

/** "il y a 5 min" — relative past time, French. */
export function formatRelative(iso: string, now: Date = new Date()): string {
  const diff = now.getTime() - new Date(iso).getTime();
  if (diff < 0) return formatDateTime(iso); // future, fall back to absolute
  if (diff < 60_000) return 'à l\u2019instant';
  return `il y a ${formatDuration(diff)}`;
}
