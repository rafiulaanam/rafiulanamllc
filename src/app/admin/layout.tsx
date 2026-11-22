import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { adminConfigured, clerkKeys } from '@/lib/backend';
import './workspace.css';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = {title:'Site administration',robots:{index:false,follow:false}};
export default function AdminLayout({children}: {children: React.ReactNode}) {
  const content = <div className="admin">{children}</div>;
  return adminConfigured() ? <ClerkProvider publishableKey={clerkKeys().publishableKey} signInUrl="/admin/login">{content}</ClerkProvider> : content;
}
