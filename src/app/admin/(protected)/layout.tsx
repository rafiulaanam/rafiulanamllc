import Link from 'next/link';
import { requireAdmin } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { SignOutButton } from '@clerk/nextjs';
export default async function ProtectedLayout({children}: {children: React.ReactNode}) {
  const {user} = await requireAdmin();
  return <><div className="admin-nav"><nav aria-label="Administration">
    {['Overview','Products','Categories','Businesses','CEO','Inquiries','Settings'].map(label => <Link key={label} href={label === 'Overview' ? '/admin' : '/admin/' + label.toLowerCase()}>{label}</Link>)}
  </nav><SignOutButton redirectUrl="/admin/login"><Button variant="outline">Sign out</Button></SignOutButton></div>
  {user.displayName && <p className="muted admin-account">{user.displayName}</p>}<div className="admin-content">{children}</div></>;
}
