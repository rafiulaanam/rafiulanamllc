import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Brand } from '@/components/brand';
import { clerkAdministrator } from '@/lib/clerk-admin';
import { SignIn, SignOutButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { adminConfigured } from '@/lib/backend';
import { Button } from '@/components/ui/button';

function SignInLoading() {
  return <div className="admin-auth-loading" role="status" aria-live="polite">
    <h1>Admin sign-in</h1>
    <p>Loading sign-in…</p>
    <div className="admin-auth-placeholder" aria-hidden="true" />
    <div className="admin-auth-placeholder admin-auth-placeholder-button" aria-hidden="true" />
  </div>;
}

export default async function Login() {
  const configured = adminConfigured();
  const clerkSession = configured ? await auth() : null;
  if (clerkSession?.userId && await clerkAdministrator(clerkSession.userId)) redirect('/admin');
  const readyForSignIn = configured && !clerkSession?.userId;

  return <div className="admin-auth">
    <header className="admin-auth-header">
      <Brand name="RAFIUL ANAM LLC" />
      <Link href="/">View public site <ArrowUpRight size={15} aria-hidden="true" /></Link>
    </header>
    <main id="main" tabIndex={-1} className="admin-auth-main">
      <section className="admin-auth-card" aria-label="Administrator authentication">
        {readyForSignIn ? <SignIn routing="hash" forceRedirectUrl="/admin" withSignUp={false} fallback={<SignInLoading />}
          appearance={{
            options: { socialButtonsPlacement: 'bottom' },
            variables: {
              colorPrimary:'#2459dc', colorForeground:'#10203a', colorMutedForeground:'#53627a',
              colorBackground:'#fff', colorInput:'#fff', colorInputForeground:'#10203a',
              fontFamily:'var(--font-geist-sans), system-ui, sans-serif', fontSize:'0.875rem', spacing:'0.8rem',
            },
            elements: {
              rootBox:'admin-auth-clerk',
              cardBox:'admin-auth-clerk-box',
              card:'admin-auth-clerk-card',
              headerTitle:'admin-auth-clerk-title',
              headerSubtitle:'admin-auth-clerk-subtitle',
              footer:'admin-auth-clerk-footer',
            },
          }}
        /> : <>
          <h1>Admin sign-in</h1>
          {configured
            ? <><p>This account does not have administrator access.</p><SignOutButton redirectUrl="/admin/login"><Button variant="outline">Sign out</Button></SignOutButton></>
            : <p>Connect Neon and Clerk to enable administrator sign-in.</p>}
        </>}
      </section>
    </main>
  </div>;
}
