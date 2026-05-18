/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output produces a minimal server.js bundle for Docker images.
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'api.qrserver.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  async redirects() {
    return [
      { source: '/portail.html', destination: '/portail', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            // We need camera access for QR scanning, geolocation for the map
            value: 'camera=(self), microphone=(), geolocation=(self), payment=(self)',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
