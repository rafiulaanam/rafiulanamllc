import Link from 'next/link';
import type { Metadata } from 'next';
import { Brand } from '@/components/brand';
import { ClerkProvider } from '@clerk/nextjs';
import { adminConfigured, clerkKeys } from '@/lib/backend';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = {title:'Site administration',robots:{index:false,follow:false}};
export default function AdminLayout({children}: {children: React.ReactNode}) {
  const content = <main id="main" className="admin site-theme"><header className="admin-header"><div className="shell"><Brand name="RAFIUL ANAM LLC" /><Link href="/">View public site</Link></div></header><div className="shell admin-main">{children}</div></main>;
  return adminConfigured() ? <ClerkProvider publishableKey={clerkKeys().publishableKey} signInUrl="/admin/login">{content}</ClerkProvider> : content;
}
