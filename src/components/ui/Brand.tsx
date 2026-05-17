/**
 * POGO brand mark — inline SVG, no external file dependency.
 * Two variants:
 *   - `BrandPogo` : full wordmark (P-O-G-O with the stylised "O" location pin)
 *   - `BrandPogoMini` : compact icon-only square (used in card thumbnails)
 *
 * The wordmark is also designed to sit next to the UEMF logo in the header
 * without clashing, since both use teal/blue/green ranges.
 */

export function BrandPogo({
  size = 'md',
  withTagline = false,
}: {
  size?: 'sm' | 'md' | 'lg';
  withTagline?: boolean;
}) {
  const dimensions = {
    sm: { svg: 28, text: 'text-base' },
    md: { svg: 40, text: 'text-xl' },
    lg: { svg: 56, text: 'text-3xl' },
  }[size];

  return (
    <div className="flex items-center gap-3">
      <svg
        width={dimensions.svg}
        height={dimensions.svg}
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="200" height="200" rx="40" fill="#00c9b1" />
        <circle cx="100" cy="100" r="60" fill="white" />
        <circle cx="100" cy="100" r="34" fill="#00c9b1" />
        <circle cx="100" cy="100" r="14" fill="white" />
      </svg>
      <div>
        <div
          className={`font-black tracking-wider leading-none text-white ${dimensions.text}`}
        >
          POGO
        </div>
        {withTagline && (
          <div className="mt-1 text-xs font-medium text-white/85">
            Trottinettes électriques du campus UEMF
          </div>
        )}
      </div>
    </div>
  );
}

export function BrandPogoMini({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="200" height="200" rx="40" fill="#00c9b1" />
      <circle cx="100" cy="100" r="60" fill="white" />
      <circle cx="100" cy="100" r="34" fill="#00c9b1" />
      <circle cx="100" cy="100" r="14" fill="white" />
    </svg>
  );
}
