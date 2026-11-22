import Link from 'next/link';
import { requireAdmin } from '@/lib/db';
import { dateLabel } from '@/lib/admin-data';
import { neonAdminOverview } from '@/lib/neon-admin-data';

export default async function AdminDashboard() {
  const {db} = await requireAdmin();
  const {published,inquiryCount,activity:recent} = await neonAdminOverview(db);
  const activity = recent.sort((a,b) => Date.parse(b.updated_at) - Date.parse(a.updated_at)).slice(0,8);
  return <><h1>Overview</h1><div className="admin-stats"><Link href="/admin/products"><span>Published products</span><strong>{published}</strong></Link><Link href="/admin/inquiries"><span>Total inquiries</span><strong>{inquiryCount}</strong></Link></div>
    <section className="admin-panel"><h2>Recent activity</h2>
      {activity.length ? <ul className="clean admin-activity">{activity.map(item => <li key={item.group + item.id}><Link className="text-link" href={item.href}>{item.label}</Link><span>{item.group}</span><time dateTime={item.updated_at}>{dateLabel(item.updated_at)}</time></li>)}</ul> : <p className="muted">No recent activity.</p>}
    </section></>;
}
