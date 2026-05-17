import type { Metadata, Viewport } from 'next';
import { Providers } from './providers';
import '@/styles/globals.css';

/**
 * Root metadata — these defaults are overridden per-route as needed.
 *
 * `themeColor` matches the UEMF blue so iOS Safari paints its top bar in
 * brand colour when the page is added to the home screen as a PWA.
 */
export const metadata: Metadata = {
  title: 'POGO — Trottinettes UEMF',
  description:
    "Réservez et déverrouillez une trottinette électrique sur le campus de l'Université Euromed de Fès.",
  applicationName: 'POGO',
  formatDetection: {
    telephone: false,
  },
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#003A7A',
  width: 'device-width',
  initialScale: 1,
  // Allow user pinch-zoom — required for WCAG 2.1 success criterion 1.4.4.
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
