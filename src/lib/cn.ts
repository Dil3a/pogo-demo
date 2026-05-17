import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combine class names with Tailwind-aware merging.
 *
 * Plain string concatenation breaks when the same utility appears twice
 * (e.g. `px-4` and `px-8` would both end up in the DOM). `tailwind-merge`
 * keeps the last one only, which is what you actually want when overriding
 * a base class from a parent component.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
