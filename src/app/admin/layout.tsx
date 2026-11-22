import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { adminConfigured, clerkKeys } from '@/lib/backend';
import './workspace.css';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = {title:'Site administration',robots:{index:false,follow:false}};

export default function AdminLayout({children}: {children: React.ReactNode}) {
  const content = <div className="admin">{children}</div>;
  if (!adminConfigured()) return content;

  return <ClerkProvider dynamic publishableKey={clerkKeys().publishableKey} signInUrl="/admin/login"
    localization={{signIn:{start:{
      title:'Admin sign-in',
      titleCombined:'Admin sign-in',
      subtitle:'Use your authorized administrator account.',
      subtitleCombined:'Use your authorized administrator account.',
    }}}}>
    {content}
  </ClerkProvider>;
}
