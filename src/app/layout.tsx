import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { siteOrigin } from '@/lib/env';
import './globals.css';
import './site-theme.css';

export const metadata: Metadata = { metadataBase: new URL(siteOrigin()) };
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return <html lang="en" className={GeistSans.variable}><body><a className="skip-link" href="#main">Skip to content</a>{children}</body></html>;
}
