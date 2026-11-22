import { SiteFooter, SiteHeader } from '@/components/site';

export const dynamic = 'force-dynamic';

export default function SiteLayout({children}: {children: React.ReactNode}) {
  return <div className="site-theme site-frame"><SiteHeader /><main id="main">{children}</main><SiteFooter /></div>;
}
