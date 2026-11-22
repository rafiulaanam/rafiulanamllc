import type { NextConfig } from 'next';
const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const testOutput = process.env.PLAYWRIGHT_NEXT_OUTPUT;
const nextConfig: NextConfig = {
  distDir: testOutput === 'unconfigured' ? '.next-unconfigured' : '.next',
  poweredByHeader: false,
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
  images: {
    remotePatterns: [
      ...(cloud && /^[\w-]+$/.test(cloud) ? [new URL('https://res.cloudinary.com/' + cloud + '/image/upload/**')] : []),
    ],
  },
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ] }];
  },
};
export default nextConfig;
