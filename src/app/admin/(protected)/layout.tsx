import { requireAdmin } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { AdminShell } from '@/components/admin/admin-shell';
import { SignOutButton } from '@clerk/nextjs';
export default async function ProtectedLayout({children}: {children: React.ReactNode}) {
  const {user} = await requireAdmin();
  const account = <SignOutButton redirectUrl="/admin/login"><Button variant="outline">Sign out</Button></SignOutButton>;
  return <AdminShell account={account} displayName={user.displayName}>{children}</AdminShell>;
}
