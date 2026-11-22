import { redirect } from 'next/navigation';
import { Eyebrow } from '@/components/site';
import { adminSession } from '@/lib/db';
import { SignIn, SignOutButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { adminConfigured } from '@/lib/backend';
import { Button } from '@/components/ui/button';
export default async function Login() {
  if (await adminSession()) redirect('/admin');
  const configured = adminConfigured();
  const clerkSession = configured ? await auth() : null;
  return <section className="admin-login"><Eyebrow>Administration</Eyebrow><h1>Admin sign-in</h1><p className="muted">Sign in with an authorized administrator account.</p>
    {configured ? clerkSession?.userId
      ? <><p className="form-notice">This account does not have administrator access.</p><SignOutButton redirectUrl="/admin/login"><Button variant="outline">Sign out</Button></SignOutButton></>
      : <SignIn routing="hash" forceRedirectUrl="/admin" withSignUp={false} />
      : <p className="form-notice">Connect Neon and Clerk to enable administrator sign-in.</p>}
  </section>;
}
